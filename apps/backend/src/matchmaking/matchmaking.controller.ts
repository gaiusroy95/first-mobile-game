import { Controller, Delete, Post, Query, Body, UseGuards } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CurrentPlayer, type AuthenticatedPlayer } from "../common/current-player.decorator";
import { MatchmakingService } from "./matchmaking.service";

class JoinQueueDto {
  @IsOptional()
  @IsString()
  @IsIn(["casual", "ranked"])
  mode?: "casual" | "ranked";
}

@Controller("matchmaking")
@UseGuards(JwtAuthGuard)
export class MatchmakingController {
  constructor(private readonly matchmaking: MatchmakingService) {}

  @Throttle({ default: { limit: 5, ttl: 10_000 } })
  @Post("queue")
  join(@CurrentPlayer() player: AuthenticatedPlayer, @Body() dto: JoinQueueDto) {
    return this.matchmaking.joinQueue(player.playerId, dto.mode ?? "casual");
  }

  @Throttle({ default: { limit: 8, ttl: 10_000 } })
  @Post("practice")
  practice(@CurrentPlayer() player: AuthenticatedPlayer) {
    return this.matchmaking.startPractice(player.playerId);
  }

  @Delete("queue")
  leave(
    @CurrentPlayer() player: AuthenticatedPlayer,
    @Query("mode") mode?: "casual" | "ranked"
  ) {
    return this.matchmaking.leaveQueue(player.playerId, mode ?? "casual");
  }
}
