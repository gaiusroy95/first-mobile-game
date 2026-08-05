import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import type { LeaderboardEntry, RankingSummary } from "@battle-formation/shared-types";
import { Player } from "../players/player.entity";
import { RedisService } from "../common/redis.module";

const LEADERBOARD_KEY = "ranking:leaderboard";
const TROPHY_DELTA_WIN = 25;
const TROPHY_DELTA_LOSS = -15;
const DEFAULT_LEADERBOARD_LIMIT = 50;

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    private readonly redis: RedisService
  ) {}

  async applyMatchResult(playerAId: string, playerBId: string, winnerId: string): Promise<void> {
    const loserId = winnerId === playerAId ? playerBId : playerAId;
    await this.adjustTrophies(winnerId, TROPHY_DELTA_WIN);
    await this.adjustTrophies(loserId, TROPHY_DELTA_LOSS);
  }

  /** Postgres stays the source of truth (survives a Redis flush); the ZSET is a write-through cache that makes leaderboard reads never touch the database. */
  private async adjustTrophies(playerId: string, delta: number): Promise<void> {
    await this.players.increment({ id: playerId }, "trophies", delta);
    const player = await this.players.findOneByOrFail({ id: playerId });

    const trophies = Math.max(0, player.trophies);
    if (trophies !== player.trophies) {
      await this.players.update({ id: playerId }, { trophies });
    }

    await this.redis.client.zadd(LEADERBOARD_KEY, trophies, playerId);
  }

  async getLeaderboard(limit = DEFAULT_LEADERBOARD_LIMIT): Promise<LeaderboardEntry[]> {
    const entries = await this.redis.client.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");
    const playerIds: string[] = [];
    const trophiesByPlayerId = new Map<string, number>();

    for (let i = 0; i < entries.length; i += 2) {
      const playerId = entries[i];
      const rawTrophies = entries[i + 1];
      if (playerId === undefined || rawTrophies === undefined) continue;
      playerIds.push(playerId);
      trophiesByPlayerId.set(playerId, Number(rawTrophies));
    }
    if (playerIds.length === 0) return [];

    const players = await this.players.find({ where: { id: In(playerIds) } });
    const displayNameByPlayerId = new Map(players.map((player) => [player.id, player.displayName]));

    return playerIds.map((playerId, index) => ({
      playerId,
      displayName: displayNameByPlayerId.get(playerId) ?? "Unknown",
      trophies: trophiesByPlayerId.get(playerId) ?? 0,
      rank: index + 1,
    }));
  }

  async getRank(playerId: string): Promise<RankingSummary> {
    const [rank, trophies] = await Promise.all([
      this.redis.client.zrevrank(LEADERBOARD_KEY, playerId),
      this.redis.client.zscore(LEADERBOARD_KEY, playerId),
    ]);
    return { rank: rank === null ? null : rank + 1, trophies: trophies ? Number(trophies) : 0 };
  }
}
