import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, type EntityManager, In, Repository } from "typeorm";
import { BattleManager, HeroManager, resolveHero, validateFormation } from "@battle-formation/game-engine";
import type { BattleResultPayload, BattleStartPayload, Formation, Hero } from "@battle-formation/shared-types";
import { OwnedHeroEntity } from "../heroes/owned-hero.entity";
import { RankingService } from "../ranking/ranking.service";
import { RewardsService } from "../rewards/rewards.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { MatchEntity } from "./match.entity";

const heroManager = new HeroManager();
/** Matches the client's prep timer duration (see apps/mobile FormationScene) - see match.entity.ts for why this is enforced here too. */
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

  createMatch(playerAId: string, playerBId: string): Promise<MatchEntity> {
    const match = this.matches.create({
      playerAId,
      playerBId,
      status: "pending",
      // A per-match deterministic seed: the same two formations replayed
      // with this seed always produce the same event log (see
      // BattleManager), which is what makes the server-authoritative
      // result reproducible and auditable after the fact.
      seed: Date.now().toString(),
      formationDeadline: new Date(Date.now() + FORMATION_DEADLINE_SECONDS * 1000),
    });
    return this.matches.save(match);
  }

  /**
   * Records one side's locked-in formation. Every check below runs inside
   * a single row-locked transaction (`pessimistic_write`), which matters:
   * without the lock, both players submitting within the same instant
   * could each read "the other side is still empty," both write, and both
   * independently observe "both sides are now full" - resolving (and
   * rewarding) the same match twice. The lock serializes the two
   * submissions so exactly one of them ever observes the completed pair.
   */
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
      // Blocks resubmission after either both sides are in ("ready") or
      // the match has already been simulated ("complete") - without this,
      // a client could keep re-submitting to force repeated resolution.
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

  /**
   * Every hero instanceId in the submitted formation must be one this
   * player actually owns. Without this, a client could field an army it
   * doesn't have - someone else's heroes, a higher-level copy that was
   * never granted, or an instanceId that doesn't exist at all - since
   * nothing else about the formation shape reveals who's supposed to own
   * what.
   */
  private async assertOwnsFormation(manager: EntityManager, playerId: string, formation: Formation): Promise<void> {
    const instanceIds = formation.slots.map((slot) => slot.instanceId);
    if (instanceIds.length === 0) return;

    const ownedCount = await manager.count(OwnedHeroEntity, { where: { id: In(instanceIds), playerId } });
    if (ownedCount !== instanceIds.length) {
      throw new ForbiddenException("Formation references heroes you don't own");
    }
  }

  /**
   * Runs the exact same BattleManager the client uses to preview/render a
   * battle - the entire point of having built it deterministic and
   * framework-agnostic. The server never trusts a client-reported winner
   * or client-reported hero stats (buildHeroMap resolves stats from the
   * database, never from anything the client sent); it recomputes the
   * outcome itself and broadcasts the identical event log and reward to
   * both participants.
   */
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

    await this.ranking.applyMatchResult(match.playerAId, match.playerBId, match.winnerId);
    // Rewards are computed and persisted here, as a direct consequence of
    // the server's own resolution - never in response to a client request
    // (see RewardsService.grantForMatch).
    const rewards = await this.rewards.grantForMatch(match);

    const toPlayerA: BattleResultPayload = {
      matchId: match.id,
      winner: result.winner,
      events: result.events,
      rewards: rewards.playerA,
    };
    const toPlayerB: BattleResultPayload = {
      matchId: match.id,
      winner: result.winner,
      events: result.events,
      rewards: rewards.playerB,
    };
    this.realtime.emitToPlayer(match.playerAId, "battle:result", toPlayerA);
    this.realtime.emitToPlayer(match.playerBId, "battle:result", toPlayerB);
  }

  /** Hero stats always come from the database (heroId + level) resolved against the shared game-engine catalog - never from anything a client submits. */
  private async buildHeroMap(playerAId: string, playerBId: string): Promise<Map<string, Hero>> {
    const owned = await this.heroes.find({ where: { playerId: In([playerAId, playerBId]) } });
    const map = new Map<string, Hero>();
    for (const hero of owned) {
      map.set(hero.id, resolveHero(heroManager.getDefinition(hero.heroId), hero.level));
    }
    return map;
  }
}
