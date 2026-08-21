import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchEntity } from "../battles/match.entity";
import { Player } from "../players/player.entity";
import { RewardEntity } from "./reward.entity";
import { RewardsService } from "./rewards.service";
import { RewardsController } from "./rewards.controller";

@Module({
  imports: [TypeOrmModule.forFeature([RewardEntity, MatchEntity, Player])],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
