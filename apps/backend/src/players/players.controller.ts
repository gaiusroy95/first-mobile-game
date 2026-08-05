import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
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
}
