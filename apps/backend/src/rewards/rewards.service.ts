import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import type { BattleRewards } from "@battle-formation/shared-types";
import { Player } from "../players/player.entity";
import { MatchEntity } from "../battles/match.entity";
import { RewardEntity } from "./reward.entity";

const WIN_REWARD: BattleRewards = { gold: 100, experience: 50 };
const LOSS_REWARD: BattleRewards = { gold: 25, experience: 10 };
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
   * there is no client-facing "claim" action. A reward is a direct,
   * automatic consequence of the server computing a winner, never
   * something a client can request, time, or replay for a second payout.
   */
  async grantForMatch(match: MatchEntity): Promise<MatchRewards> {
    return {
      playerA: await this.grant(match, match.playerAId),
      playerB: await this.grant(match, match.playerBId),
    };
  }

  private async grant(match: MatchEntity, playerId: string): Promise<BattleRewards> {
    const existing = await this.rewards.findOne({ where: { matchId: match.id, playerId } });
    if (existing) return existing;

    const reward = match.winnerId === playerId ? WIN_REWARD : LOSS_REWARD;

    try {
      // The reward row and the gold credit commit together or not at all.
      return await this.dataSource.transaction(async (manager) => {
        const saved = await manager.save(RewardEntity, { matchId: match.id, playerId, ...reward });
        await manager.increment(Player, { id: playerId }, "gold", reward.gold);
        return saved;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        // grantForMatch ran twice for this match (shouldn't happen given
        // the status guard in BattlesService, but the constraint - not
        // this catch - is the actual guarantee) - return what was already
        // granted instead of granting again.
        return this.rewards.findOneByOrFail({ matchId: match.id, playerId });
      }
      throw error;
    }
  }

  getForMatch(matchId: string, playerId: string): Promise<RewardEntity | null> {
    return this.rewards.findOne({ where: { matchId, playerId } });
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === UNIQUE_VIOLATION;
}
