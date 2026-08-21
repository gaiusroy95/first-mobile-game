import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BattlesModule } from "../battles/battles.module";
import { TournamentEntity } from "./tournament.entity";
import { TournamentService } from "./tournament.service";
import { TournamentController } from "./tournament.controller";

@Module({
  imports: [TypeOrmModule.forFeature([TournamentEntity]), BattlesModule],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}
