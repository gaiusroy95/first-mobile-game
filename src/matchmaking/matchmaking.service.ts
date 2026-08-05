import { Injectable } from "@nestjs/common";
import type { MatchFoundPayload } from "@battle-formation/shared-types";
import { PlayersService } from "../players/players.service";
import { BattlesService } from "../battles/battles.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { RedisService } from "../common/redis.module";

const QUEUE_KEY = "matchmaking:queue";
/** How far apart two players' trophy counts can be and still be paired. */
const RATING_WINDOW = 100;

export type QueueResult = { status: "queued" } | { status: "matched"; matchId: string };

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly redis: RedisService,
    private readonly players: PlayersService,
    private readonly battles: BattlesService,
    private readonly realtime: RealtimeGateway
  ) {}

  /**
   * Redis ZSET (score = trophies) is what makes this queue correct under
   * horizontal scaling: every backend instance reads and writes the same
   * queue, so it doesn't matter which instance either player's join
   * request lands on. Not fully race-proof under concurrent joins (see the
   * ZREM check below) - a dedicated single-consumer matchmaking worker is
   * the documented next step once concurrent join volume makes that
   * matter (see the scalability notes).
   */
  async joinQueue(playerId: string): Promise<QueueResult> {
    const profile = await this.players.findById(playerId);
    const client = this.redis.client;

    const candidates = await client.zrangebyscore(
      QUEUE_KEY,
      profile.trophies - RATING_WINDOW,
      profile.trophies + RATING_WINDOW,
      "LIMIT",
      0,
      1
    );

    const opponentId = candidates[0];
    if (!opponentId) {
      await client.zadd(QUEUE_KEY, profile.trophies, playerId);
      return { status: "queued" };
    }

    const removed = await client.zrem(QUEUE_KEY, opponentId);
    if (removed === 0) {
      // Another instance matched this opponent between our read and this
      // removal - fall back to queueing ourselves rather than risk
      // double-matching the same opponent.
      await client.zadd(QUEUE_KEY, profile.trophies, playerId);
      return { status: "queued" };
    }

    const match = await this.battles.createMatch(playerId, opponentId);

    const toPlayer: MatchFoundPayload = { matchId: match.id, opponentId };
    const toOpponent: MatchFoundPayload = { matchId: match.id, opponentId: playerId };
    this.realtime.emitToPlayer(playerId, "matchmaking:found", toPlayer);
    this.realtime.emitToPlayer(opponentId, "matchmaking:found", toOpponent);

    return { status: "matched", matchId: match.id };
  }

  async leaveQueue(playerId: string): Promise<void> {
    await this.redis.client.zrem(QUEUE_KEY, playerId);
  }
}
