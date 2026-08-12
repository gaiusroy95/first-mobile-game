import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { TournamentService } from "./tournament.service";

@Controller("tournaments")
@UseGuards(JwtAuthGuard)
export class TournamentController {
  constructor(private readonly tournaments: TournamentService) {}

  @Get()
  list() {
    return this.tournaments.list();
  }

  @Post(":id/join")
  join(@CurrentPlayer() player: AuthenticatedPlayer, @Param("id") id: string) {
    return this.tournaments.join(id, player.playerId);
  }
}
