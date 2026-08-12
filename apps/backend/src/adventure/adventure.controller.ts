import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsObject } from "class-validator";
import type { Formation } from "@battle-formation/shared-types";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { AdventureService } from "./adventure.service";

class PlayAdventureDto {
  @IsObject()
  formation: Formation;
}

@Controller("adventure")
@UseGuards(JwtAuthGuard)
export class AdventureController {
  constructor(private readonly adventure: AdventureService) {}

  @Get("stages")
  stages() {
    return this.adventure.listStages();
  }

  @Get("progress")
  progress(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.adventure.getProgress(player.playerId);
  }

  @Post("stages/:stageId/play")
  play(
    @CurrentPlayer() player: AuthenticatedPlayer,
    @Param("stageId") stageId: string,
    @Body() dto: PlayAdventureDto
  ) {
    return this.adventure.playStage(player.playerId, Number(stageId), dto.formation);
  }
}
