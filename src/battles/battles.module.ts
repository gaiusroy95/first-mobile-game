import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OwnedHeroEntity } from "../heroes/owned-hero.entity";
import { RankingModule } from "../ranking/ranking.module";
import { RewardsModule } from "../rewards/rewards.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { MatchEntity } from "./match.entity";
import { BattlesService } from "./battles.service";
import { BattlesController } from "./battles.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEntity, OwnedHeroEntity]),
    RankingModule,
    RewardsModule,
    RealtimeModule,
  ],
  controllers: [BattlesController],
  providers: [BattlesService],
  exports: [BattlesService],
})
export class BattlesModule {}
