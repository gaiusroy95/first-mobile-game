import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { RewardsService } from "./rewards.service";

@Controller("rewards")
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  /** Read-only: what the server already granted. See RewardsService.grantForMatch for where that actually happens. */
  @Get(":matchId")
  get(@CurrentPlayer() player: AuthenticatedPlayer, @Param("matchId") matchId: string) {
    return this.rewards.getForMatch(matchId, player.playerId);
  }
}
