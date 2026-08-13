import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, type EntityManager, In, Repository } from "typeorm";
import {
  BattleManager,
  HeroManager,
  allSlots,
  resolveHero,
  slotToCoordinate,
  validateFormation,
} from "@battle-formation/game-engine";
import type { BattleResultPayload, BattleStartPayload, Formation, Hero } from "@battle-formation/shared-types";
import { OwnedHeroEntity } from "../heroes/owned-hero.entity";
import { RankingService } from "../ranking/ranking.service";
import { RewardsService } from "../rewards/rewards.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { MatchEntity } from "./match.entity";

const heroManager = new HeroManager();
/** Matches the client's prep timer duration (see apps/mobile FormationScene). */
const FORMATION_DEADLINE_SECONDS = 20;

@Injectable()
export class BattlesService {
  constructor(
    @InjectRepository(MatchEntity) private readonly matches: Repository<MatchEntity>,
    @InjectRepository(OwnedHeroEntity) private readonly heroes: Repository<OwnedHeroEntity>,
    private readonly dataSource: DataSource,
    private readonly ranking: RankingService,
    private readonly rewards: RewardsService,
    private readonly realtime: RealtimeGateway
  ) {}

  createMatch(playerAId: string, playerBId: string, mode = "casual"): Promise<MatchEntity> {
    const match = this.matches.create({
      playerAId,
      playerBId,
      status: "pending",
      mode,
      seed: Date.now().toString(),
      formationDeadline: new Date(Date.now() + FORMATION_DEADLINE_SECONDS * 1000),
    });
    return this.matches.save(match);
  }

  async submitFormation(matchId: string, playerId: string, formation: Formation): Promise<void> {
    const match = await this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MatchEntity, {
        where: { id: matchId },
        lock: { mode: "pessimistic_write" },
      });
      if (!current) throw new NotFoundException("Match not found");

      const isPlayerA = current.playerAId === playerId;
      if (!isPlayerA && current.playerBId !== playerId) {
        throw new ForbiddenException("Not a participant in this match");
      }
      if (current.status !== "pending") {
        throw new ForbiddenException("Formation already locked in for this match");
      }
      if (Date.now() > current.formationDeadline.getTime()) {
        throw new BadRequestException("Formation submission deadline has passed");
      }

      await this.assertOwnsFormation(manager, playerId, formation);

      const validation = validateFormation(formation);
      if (!validation.valid) {
        throw new BadRequestException(validation.errors);
      }

      if (isPlayerA) current.formationA = formation;
      else current.formationB = formation;

      // Practice vs bot: auto-lock the empty side so a single device can demo.
      if (current.mode === "practice" && !(current.formationA && current.formationB)) {
        const botId = isPlayerA ? current.playerBId : current.playerAId;
        const botFormation = await this.buildDefaultFormation(manager, botId);
        if (isPlayerA) current.formationB = botFormation;
        else current.formationA = botFormation;
      }

      if (current.formationA && current.formationB) {
        current.status = "ready";
      }
      return manager.save(current);
    });

    if (match.status === "ready") {
      const startPayload: BattleStartPayload = { matchId: match.id };
      this.realtime.emitToPlayer(match.playerAId, "battle:start", startPayload);
      this.realtime.emitToPlayer(match.playerBId, "battle:start", startPayload);
      await this.resolve(match);
    }
  }

  private async buildDefaultFormation(manager: EntityManager, playerId: string): Promise<Formation> {
    const owned = await manager.find(OwnedHeroEntity, { where: { playerId }, take: 6 });
    if (owned.length < 6) {
      throw new BadRequestException("Opponent roster incomplete");
    }
    return {
      playerId,
      slots: allSlots().map((slot, index) => {
        const { col, row } = slotToCoordinate(slot);
        return { instanceId: owned[index]!.id, col, row };
      }),
    };
  }

  private async assertOwnsFormation(manager: EntityManager, playerId: string, formation: Formation): Promise<void> {
    const instanceIds = formation.slots.map((slot) => slot.instanceId);
    if (instanceIds.length === 0) return;

    const ownedCount = await manager.count(OwnedHeroEntity, { where: { id: In(instanceIds), playerId } });
    if (ownedCount !== instanceIds.length) {
      throw new ForbiddenException("Formation references heroes you don't own");
    }
  }

  private async resolve(match: MatchEntity): Promise<void> {
    const heroesByInstanceId = await this.buildHeroMap(match.playerAId, match.playerBId);
    const manager = new BattleManager(
      match.formationA as Formation,
      match.formationB as Formation,
      heroesByInstanceId,
      Number(match.seed)
    );
    const result = manager.run();

    match.winnerId = result.winner === "playerA" ? match.playerAId : match.playerBId;
    match.eventLog = result.events;
    match.status = "complete";
    await this.matches.save(match);

    await this.ranking.applyMatchResult(match.playerAId, match.playerBId, match.winnerId, match.mode);
    const rewards = await this.rewards.grantForMatch(match);

    const formationA = match.formationA as Formation;
    const formationB = match.formationB as Formation;
    const toPlayerA: BattleResultPayload = {
      matchId: match.id,
      winner: result.winner,
      events: result.events,
      rewards: rewards.playerA,
      formationA,
      formationB,
    };
    const toPlayerB: BattleResultPayload = {
      matchId: match.id,
      winner: result.winner,
      events: result.events,
      rewards: rewards.playerB,
      formationA,
      formationB,
    };
    this.realtime.emitToPlayer(match.playerAId, "battle:result", toPlayerA);
    this.realtime.emitToPlayer(match.playerBId, "battle:result", toPlayerB);
  }

  private async buildHeroMap(playerAId: string, playerBId: string): Promise<Map<string, Hero>> {
    const owned = await this.heroes.find({ where: { playerId: In([playerAId, playerBId]) } });
    const map = new Map<string, Hero>();
    for (const hero of owned) {
      map.set(hero.id, resolveHero(heroManager.getDefinition(hero.heroId), hero.level));
    }
    return map;
  }
}
