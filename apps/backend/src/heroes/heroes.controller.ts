import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { HeroesService } from "./heroes.service";

class UnlockHeroDto {
  @IsString()
  heroId: string;
}

class EquipCosmeticDto {
  @IsOptional()
  @IsString()
  cosmeticId: string | null;
}

@Controller("heroes")
@UseGuards(JwtAuthGuard)
export class HeroesController {
  constructor(private readonly heroes: HeroesService) {}

  @Get()
  list(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.heroes.listOwned(player.playerId);
  }

  @Post("unlock")
  unlock(@CurrentPlayer() player: AuthenticatedPlayer, @Body() dto: UnlockHeroDto) {
    return this.heroes.unlockHero(player.playerId, dto.heroId);
  }

  @Post(":instanceId/upgrade")
  upgrade(@CurrentPlayer() player: AuthenticatedPlayer, @Param("instanceId") instanceId: string) {
    return this.heroes.upgrade(player.playerId, instanceId);
  }

  @Post(":instanceId/cosmetic")
  equipCosmetic(
    @CurrentPlayer() player: AuthenticatedPlayer,
    @Param("instanceId") instanceId: string,
    @Body() dto: EquipCosmeticDto
  ) {
    return this.heroes.equipCosmetic(player.playerId, instanceId, dto.cosmeticId ?? null);
  }
}
