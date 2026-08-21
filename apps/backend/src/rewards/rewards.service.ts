import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import type { BattleRewards } from "@battle-formation/shared-types";
import { Player } from "../players/player.entity";
import { MatchEntity } from "../battles/match.entity";
import { RewardEntity } from "./reward.entity";

const XP_PER_LEVEL = 100;
const TROPHY_WIN = 25;
const TROPHY_LOSS = -15;

const WIN_REWARD = { gold: 100, experience: 50 };
const LOSS_REWARD = { gold: 25, experience: 10 };

/** Postgres unique_violation - see reward.entity.ts. */
const UNIQUE_VIOLATION = "23505";

export interface MatchRewards {
  playerA: BattleRewards;
  playerB: BattleRewards;
}

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(RewardEntity) private readonly rewards: Repository<RewardEntity>,
    private readonly dataSource: DataSource
  ) {}

  /**
   * Called exactly once by BattlesService right after a match resolves -
   * there is no client-facing "claim" action.
   */
  async grantForMatch(match: MatchEntity): Promise<MatchRewards> {
    return {
      playerA: await this.grant(match, match.playerAId),
      playerB: await this.grant(match, match.playerBId),
    };
  }

  private async grant(match: MatchEntity, playerId: string): Promise<BattleRewards> {
    const existing = await this.rewards.findOne({ where: { matchId: match.id, playerId } });
    if (existing) {
      return {
        gold: existing.gold,
        experience: existing.experience,
        trophyDelta: existing.trophyDelta,
        heroCards: existing.heroCards ?? [],
        materials: existing.materials ?? [],
      };
    }

    const won = match.winnerId === playerId;
    const isPractice = match.mode === "practice";
    const base = won ? WIN_REWARD : LOSS_REWARD;
    const gold = isPractice ? Math.floor(base.gold / 2) : base.gold;
    const experience = isPractice ? Math.floor(base.experience / 2) : base.experience;
    const trophyDelta = isPractice ? 0 : won ? TROPHY_WIN : TROPHY_LOSS;
    const heroCards = [{ heroId: "unit-arab-vanguard", count: won ? (isPractice ? 1 : 2) : 1 }];
    const materials = [
      { materialId: "essence_common", count: won ? (isPractice ? 1 : 3) : 1 },
      { materialId: "essence_rare", count: won && !isPractice ? 1 : 0 },
    ].filter((m) => m.count > 0);

    const reward: BattleRewards = {
      gold,
      experience,
      trophyDelta,
      heroCards,
      materials,
    };

    try {
      return await this.dataSource.transaction(async (manager) => {
        const saved = await manager.save(RewardEntity, {
          matchId: match.id,
          playerId,
          gold: reward.gold,
          experience: reward.experience,
          trophyDelta,
          heroCards,
          materials,
        });

        const player = await manager.findOneByOrFail(Player, { id: playerId });
        player.gold += reward.gold;
        player.xp += reward.experience;
        while (player.xp >= XP_PER_LEVEL) {
          player.xp -= XP_PER_LEVEL;
          player.level += 1;
        }

        const cards = { ...(player.heroCards ?? {}) };
        for (const drop of heroCards) {
          cards[drop.heroId] = (cards[drop.heroId] ?? 0) + drop.count;
        }
        player.heroCards = cards;

        const mats = { ...(player.materials ?? {}) };
        for (const drop of materials) {
          mats[drop.materialId] = (mats[drop.materialId] ?? 0) + drop.count;
        }
        player.materials = mats;

        await manager.save(player);
        return {
          gold: saved.gold,
          experience: saved.experience,
          trophyDelta: saved.trophyDelta,
          heroCards: saved.heroCards,
          materials: saved.materials,
        };
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.grant(match, playerId);
      }
      throw error;
    }
  }

  getForMatch(matchId: string, playerId: string): Promise<RewardEntity | null> {
    return this.rewards.findOne({ where: { matchId, playerId } });
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === UNIQUE_VIOLATION
  );
}
