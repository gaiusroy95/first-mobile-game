import { Body, Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { BattlesService } from "./battles.service";
import { SubmitFormationDto } from "./dto";

@Controller("battles")
@UseGuards(JwtAuthGuard)
export class BattlesController {
  constructor(private readonly battles: BattlesService) {}

  // The status/deadline/lock guards in BattlesService already make repeat
  // submissions a no-op past the first, valid one - this throttle just
  // keeps a spam loop from generating load (DB transactions, lock
  // contention) for no effect.
  @Throttle({ default: { limit: 10, ttl: 10_000 } })
  @Post(":matchId/formation")
  @HttpCode(204)
  submitFormation(
    @CurrentPlayer() player: AuthenticatedPlayer,
    @Param("matchId") matchId: string,
    @Body() dto: SubmitFormationDto
  ) {
    return this.battles.submitFormation(matchId, player.playerId, dto.formation);
  }
}
