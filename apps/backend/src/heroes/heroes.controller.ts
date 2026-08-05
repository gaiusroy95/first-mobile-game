import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { HeroesService } from "./heroes.service";

@Controller("heroes")
@UseGuards(JwtAuthGuard)
export class HeroesController {
  constructor(private readonly heroes: HeroesService) {}

  @Get()
  list(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.heroes.listOwned(player.playerId);
  }

  @Post(":instanceId/upgrade")
  upgrade(@CurrentPlayer() player: AuthenticatedPlayer, @Param("instanceId") instanceId: string) {
    return this.heroes.upgrade(player.playerId, instanceId);
  }
}
