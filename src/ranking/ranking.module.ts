import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "../players/player.entity";
import { RankingService } from "./ranking.service";
import { RankingController } from "./ranking.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
