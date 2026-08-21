import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OwnedHeroEntity } from "../heroes/owned-hero.entity";
import { PlayersModule } from "../players/players.module";
import { AdventureProgressEntity } from "./adventure-progress.entity";
import { AdventureService } from "./adventure.service";
import { AdventureController } from "./adventure.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AdventureProgressEntity, OwnedHeroEntity]), PlayersModule],
  controllers: [AdventureController],
  providers: [AdventureService],
  exports: [AdventureService],
})
export class AdventureModule {}
