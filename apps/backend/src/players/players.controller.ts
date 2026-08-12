import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { PlayersService } from "./players.service";

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  displayName?: string;
}

class BuyCosmeticDto {
  @IsString()
  cosmeticId: string;
}

@Controller("players")
@UseGuards(JwtAuthGuard)
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get("me")
  getMe(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.players.findById(player.playerId);
  }

  @Patch("me")
  updateMe(@CurrentPlayer() player: AuthenticatedPlayer, @Body() dto: UpdateProfileDto) {
    return this.players.updateProfile(player.playerId, dto);
  }

  @Post("cosmetics/buy")
  buyCosmetic(@CurrentPlayer() player: AuthenticatedPlayer, @Body() dto: BuyCosmeticDto) {
    return this.players.unlockCosmetic(player.playerId, dto.cosmeticId, 50);
  }
}
