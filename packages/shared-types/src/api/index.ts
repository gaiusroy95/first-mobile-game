import type { BattleEvent, BattleRewards, PlayerSide } from "../domain";

/**
 * Wire contracts shared between the backend (apps/backend) and any client
 * (apps/mobile) - the same reason domain/ and bridge/ exist: both sides
 * import the identical type, so a mismatched field name or shape is a
 * compile error instead of a runtime surprise discovered in QA.
 */

/** POST /auth/register, POST /auth/login */
export interface AuthResponse {
  token: string;
  playerId: string;
  displayName: string;
}

/** GET /ranking/leaderboard */
export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  trophies: number;
  rank: number;
}

/** GET /ranking/me */
export interface RankingSummary {
  trophies: number;
  rank: number | null;
}

/**
 * GET /rewards/:matchId - a read of what the server already granted, never
 * a request to grant something. Rewards are computed and persisted by
 * BattlesService the moment a match resolves (see battles.service.ts);
 * this endpoint exists only so a client that reconnects after missing the
 * "battle:result" push can still find out what it received.
 */
export interface RewardResponse {
  gold: number;
  experience: number;
}

/** WebSocket: server -> client, "matchmaking:found" */
export interface MatchFoundPayload {
  matchId: string;
  opponentId: string;
}

/** WebSocket: server -> client, "battle:start" - both formations are locked in, the authoritative simulation is about to run. */
export interface BattleStartPayload {
  matchId: string;
}

/**
 * WebSocket: server -> client, "battle:result". `rewards` is this
 * recipient's own reward specifically (each player gets their own emit
 * with their own amount, never the opponent's) - already granted and
 * persisted by the time this event fires, not a promise of a future grant.
 */
export interface BattleResultPayload {
  matchId: string;
  winner: PlayerSide;
  events: BattleEvent[];
  rewards: BattleRewards;
}
