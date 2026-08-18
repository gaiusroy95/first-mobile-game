import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, type EntityManager, In, Repository } from "typeorm";
import {
  BattleManager,
  HeroManager,
  allSlots,
  pickDefaultSquad,
  resolveHero,
  slotToCoordinate,
  squadInstanceIds,
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
    if (playerAId === playerBId) {
      throw new BadRequestException("Cannot match a player against themselves");
    }
    const match = this.matches.create({
      playerAId,
      playerBId,
      status: "pending",
      mode,
      seed: Date.now().toString(),
      formationDeadline: new Date(Date.now() + FORMATION_DEADLINE_SECONDS * 1000),
    });
    return this.matches.save(match).then((saved) => {
      if (saved.mode !== "practice") {
        setTimeout(() => {
          void this.lockExpiredMatch(saved.id);
        }, (FORMATION_DEADLINE_SECONDS + 2) * 1000);
      }
      return saved;
    });
  }

  async submitFormation(
    matchId: string,
    playerId: string,
    formation: Formation
  ): Promise<BattleResultPayload | null> {
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
      if (current.status === "complete" || current.status === "ready") {
        return current;
      }
      if (current.status !== "pending") {
        throw new ForbiddenException("Formation already locked in for this match");
      }
      if (current.mode !== "practice" && Date.now() > current.formationDeadline.getTime()) {
        throw new BadRequestException("Formation submission deadline has passed");
      }

      await this.assertOwnsFormation(manager, playerId, formation);

      const definitionByInstanceId = await this.definitionsFor(manager, formation);
      const validation = validateFormation(formation, definitionByInstanceId);
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

    if (match.status === "complete") {
      return this.payloadForPlayer(match, playerId);
    }

    if (match.status === "ready") {
      const startPayload: BattleStartPayload = { matchId: match.id };
      this.realtime.emitToPlayer(match.playerAId, "battle:start", startPayload);
      this.realtime.emitToPlayer(match.playerBId, "battle:start", startPayload);
      return this.resolve(match, playerId);
    }

    return null;
  }

  /** If either side missed the 20s window, fill defaults and start the fight. */
  private async lockExpiredMatch(matchId: string): Promise<void> {
    const match = await this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(MatchEntity, {
        where: { id: matchId },
        lock: { mode: "pessimistic_write" },
      });
      if (!current || current.status !== "pending") return null;
      if (Date.now() < current.formationDeadline.getTime()) return null;

      if (!current.formationA) {
        current.formationA = await this.buildDefaultFormation(manager, current.playerAId);
      }
      if (!current.formationB) {
        current.formationB = await this.buildDefaultFormation(manager, current.playerBId);
      }
      current.status = "ready";
      return manager.save(current);
    });

    if (match?.status === "ready") {
      const startPayload: BattleStartPayload = { matchId: match.id };
      this.realtime.emitToPlayer(match.playerAId, "battle:start", startPayload);
      this.realtime.emitToPlayer(match.playerBId, "battle:start", startPayload);
      await this.resolve(match);
    }
  }

  private async buildDefaultFormation(manager: EntityManager, playerId: string): Promise<Formation> {
    const owned = await manager.find(OwnedHeroEntity, {
      where: { playerId },
      order: { createdAt: "ASC" },
    });
    const pick = pickDefaultSquad(
      owned.map((row) => ({ instanceId: row.id, heroId: row.heroId })),
      (heroId) => heroManager.getDefinition(heroId)
    );
    const ids = pick
      ? squadInstanceIds(pick)
      : owned.slice(0, 6).map((row) => row.id);
    if (ids.length < 6) {
      throw new BadRequestException("Opponent roster incomplete");
    }
    return {
      playerId,
      slots: allSlots().map((slot, index) => {
        const { col, row } = slotToCoordinate(slot);
        return { instanceId: ids[index]!, col, row };
      }),
    };
  }

  private async definitionsFor(
    manager: EntityManager,
    formation: Formation
  ): Promise<Map<string, import("@battle-formation/shared-types").HeroDefinition>> {
    const instanceIds = formation.slots.map((slot) => slot.instanceId);
    const owned = await manager.find(OwnedHeroEntity, { where: { id: In(instanceIds) } });
    const map = new Map<string, import("@battle-formation/shared-types").HeroDefinition>();
    for (const row of owned) {
      map.set(row.id, heroManager.getDefinition(row.heroId));
    }
    return map;
  }

  private async assertOwnsFormation(manager: EntityManager, playerId: string, formation: Formation): Promise<void> {
    const instanceIds = formation.slots.map((slot) => slot.instanceId);
    if (instanceIds.length === 0) return;

    const ownedCount = await manager.count(OwnedHeroEntity, { where: { id: In(instanceIds), playerId } });
    if (ownedCount !== instanceIds.length) {
      throw new ForbiddenException("Formation references heroes you don't own");
    }
  }

  private async payloadForPlayer(match: MatchEntity, playerId: string): Promise<BattleResultPayload> {
    const row = await this.rewards.getForMatch(match.id, playerId);
    return {
      matchId: match.id,
      winner: match.winnerId === match.playerAId ? "playerA" : "playerB",
      events: match.eventLog ?? [],
      rewards: {
        gold: row?.gold ?? 0,
        experience: row?.experience ?? 0,
        trophyDelta: row?.trophyDelta,
        heroCards: row?.heroCards ?? [],
        materials: row?.materials ?? [],
      },
      formationA: match.formationA as Formation,
      formationB: match.formationB as Formation,
    };
  }

  private async resolve(match: MatchEntity, recipientId?: string): Promise<BattleResultPayload> {
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
    return recipientId === match.playerBId ? toPlayerB : toPlayerA;
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
