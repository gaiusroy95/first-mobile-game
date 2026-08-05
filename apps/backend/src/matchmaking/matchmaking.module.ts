import { Module } from "@nestjs/common";
import { PlayersModule } from "../players/players.module";
import { BattlesModule } from "../battles/battles.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { MatchmakingService } from "./matchmaking.service";
import { MatchmakingController } from "./matchmaking.controller";

@Module({
  imports: [PlayersModule, BattlesModule, RealtimeModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
})
export class MatchmakingModule {}
