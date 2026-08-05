import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayersModule } from "../players/players.module";
import { OwnedHeroEntity } from "./owned-hero.entity";
import { HeroesService } from "./heroes.service";
import { HeroesController } from "./heroes.controller";

@Module({
  imports: [TypeOrmModule.forFeature([OwnedHeroEntity]), PlayersModule],
  controllers: [HeroesController],
  providers: [HeroesService],
  exports: [HeroesService],
})
export class HeroesModule {}
