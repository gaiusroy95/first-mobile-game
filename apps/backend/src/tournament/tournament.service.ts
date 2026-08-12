import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TournamentEntity } from "./tournament.entity";
import { BattlesService } from "../battles/battles.service";

@Injectable()
export class TournamentService implements OnModuleInit {
  constructor(
    @InjectRepository(TournamentEntity) private readonly tournaments: Repository<TournamentEntity>,
    private readonly battles: BattlesService
  ) {}

  async onModuleInit(): Promise<void> {
    const open = await this.tournaments.findOne({ where: { status: "open" } });
    if (!open) {
      await this.tournaments.save(
        this.tournaments.create({
          name: "Weekly Cup",
          status: "open",
          maxPlayers: 8,
          playerIds: [],
          bracket: [],
        })
      );
    }
  }

  list(): Promise<TournamentEntity[]> {
    return this.tournaments.find({ order: { createdAt: "DESC" } });
  }

  async join(tournamentId: string, playerId: string): Promise<TournamentEntity> {
    const tournament = await this.tournaments.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException("Tournament not found");
    if (tournament.status !== "open") throw new BadRequestException("Tournament not open");
    if (tournament.playerIds.includes(playerId)) return tournament;
    if (tournament.playerIds.length >= tournament.maxPlayers) {
      throw new BadRequestException("Tournament full");
    }

    tournament.playerIds = [...tournament.playerIds, playerId];
    if (tournament.playerIds.length === tournament.maxPlayers) {
      tournament.status = "running";
      tournament.bracket = await this.seedBracket(tournament.playerIds);
    }
    return this.tournaments.save(tournament);
  }

  private async seedBracket(playerIds: string[]): Promise<TournamentEntity["bracket"]> {
    const bracket: TournamentEntity["bracket"] = [];
    for (let i = 0; i < playerIds.length; i += 2) {
      const a = playerIds[i]!;
      const b = playerIds[i + 1];
      if (!b) {
        bracket.push({ playerAId: a, playerBId: a, matchId: null, winnerId: a });
        continue;
      }
      const match = await this.battles.createMatch(a, b, "tournament");
      bracket.push({ playerAId: a, playerBId: b, matchId: match.id, winnerId: null });
    }
    return bracket;
  }
}
