import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { RankingService } from "./ranking.service";

@Controller("ranking")
@UseGuards(JwtAuthGuard)
export class RankingController {
  constructor(private readonly ranking: RankingService) {}

  @Get("leaderboard")
  leaderboard(@Query("limit") limit?: string) {
    return this.ranking.getLeaderboard(limit ? Number(limit) : undefined);
  }

  @Get("me")
  me(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.ranking.getRank(player.playerId);
  }
}
