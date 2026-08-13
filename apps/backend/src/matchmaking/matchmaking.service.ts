import { Injectable, OnModuleInit } from "@nestjs/common";
import type { MatchFoundPayload } from "@battle-formation/shared-types";
import { PlayersService } from "../players/players.service";
import { BattlesService } from "../battles/battles.service";
import { HeroesService } from "../heroes/heroes.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { RedisService } from "../common/redis.module";

const RATING_WINDOW_CASUAL = 150;
const RATING_WINDOW_RANKED = 80;

/** Fixed system account used for 1-device Practice demos. */
export const PRACTICE_BOT_USERNAME = "__practice_bot__";

export type QueueResult =
  | { status: "queued" }
  | { status: "matched"; matchId: string; match: MatchFoundPayload };
export type PvpMode = "casual" | "ranked";

@Injectable()
export class MatchmakingService implements OnModuleInit {
  private botPlayerId: string | null = null;

  constructor(
    private readonly redis: RedisService,
    private readonly players: PlayersService,
    private readonly battles: BattlesService,
    private readonly heroes: HeroesService,
    private readonly realtime: RealtimeGateway
  ) {}

  async onModuleInit(): Promise<void> {
    this.botPlayerId = await this.ensurePracticeBot();
  }

  getPracticeBotId(): string | null {
    return this.botPlayerId;
  }

  private queueKey(mode: PvpMode): string {
    return `matchmaking:queue:${mode}`;
  }

  private ratingWindow(mode: PvpMode): number {
    return mode === "ranked" ? RATING_WINDOW_RANKED : RATING_WINDOW_CASUAL;
  }

  /** One-device demo: instant match vs bot; bot auto-locks when you confirm. */
  async startPractice(playerId: string): Promise<QueueResult> {
    const botId = this.botPlayerId ?? (await this.ensurePracticeBot());
    this.botPlayerId = botId;

    const match = await this.battles.createMatch(playerId, botId, "practice");
    const payload = await this.emitMatchFound(
      match.id,
      playerId,
      botId,
      match.playerAId,
      match.playerBId,
      match.formationDeadline,
      { notifyOpponent: false }
    );
    return { status: "matched", matchId: match.id, match: payload };
  }

  async joinQueue(playerId: string, mode: PvpMode = "casual"): Promise<QueueResult> {
    const queueKey = this.queueKey(mode);
    const window = this.ratingWindow(mode);
    const profile = await this.players.findById(playerId);
    const client = this.redis.client;

    const candidates = await client.zrangebyscore(
      queueKey,
      profile.trophies - window,
      profile.trophies + window,
      "LIMIT",
      0,
      1
    );

    const opponentId = candidates[0];
    if (!opponentId) {
      await client.zadd(queueKey, profile.trophies, playerId);
      return { status: "queued" };
    }

    const removed = await client.zrem(queueKey, opponentId);
    if (removed === 0) {
      await client.zadd(queueKey, profile.trophies, playerId);
      return { status: "queued" };
    }

    const match = await this.battles.createMatch(playerId, opponentId, mode);
    const payload = await this.emitMatchFound(
      match.id,
      playerId,
      opponentId,
      match.playerAId,
      match.playerBId,
      match.formationDeadline
    );

    return { status: "matched", matchId: match.id, match: payload };
  }

  async leaveQueue(playerId: string, mode: PvpMode = "casual"): Promise<void> {
    await this.redis.client.zrem(this.queueKey(mode), playerId);
  }

  private async ensurePracticeBot(): Promise<string> {
    const bot = await this.players.ensurePracticeBot(PRACTICE_BOT_USERNAME, "Training Bot");
    await this.heroes.grantStarterRoster(bot.id);
    return bot.id;
  }

  private async emitMatchFound(
    matchId: string,
    playerId: string,
    opponentId: string,
    playerAId: string,
    playerBId: string,
    formationDeadline: Date,
    options: { notifyOpponent?: boolean } = {}
  ): Promise<MatchFoundPayload> {
    const notifyOpponent = options.notifyOpponent !== false;
    const [rosterA, rosterB] = await Promise.all([
      this.heroes.buildRoster(playerAId, "playerA"),
      this.heroes.buildRoster(playerBId, "playerB"),
    ]);
    const roster = [...rosterA, ...rosterB];
    const deadline = formationDeadline.toISOString();

    const toPlayer: MatchFoundPayload = {
      matchId,
      opponentId,
      playerAId,
      playerBId,
      formationDeadline: deadline,
      roster,
    };
    this.realtime.emitToPlayer(playerId, "matchmaking:found", toPlayer);

    if (notifyOpponent) {
      const toOpponent: MatchFoundPayload = {
        matchId,
        opponentId: playerId,
        playerAId,
        playerBId,
        formationDeadline: deadline,
        roster,
      };
      this.realtime.emitToPlayer(opponentId, "matchmaking:found", toOpponent);
    }
    return toPlayer;
  }
}
