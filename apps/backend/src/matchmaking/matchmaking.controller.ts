import { Controller, Delete, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { MatchmakingService } from "./matchmaking.service";

@Controller("matchmaking")
@UseGuards(JwtAuthGuard)
export class MatchmakingController {
  constructor(private readonly matchmaking: MatchmakingService) {}

  // Tighter than the global default (see AppModule) - joining repeatedly
  // in a tight loop is the only way a client could try to game pairing
  // (e.g. spamming joins hoping to land next to a specific opponent).
  @Throttle({ default: { limit: 5, ttl: 10_000 } })
  @Post("queue")
  join(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.matchmaking.joinQueue(player.playerId);
  }

  @Delete("queue")
  leave(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.matchmaking.leaveQueue(player.playerId);
  }
}
