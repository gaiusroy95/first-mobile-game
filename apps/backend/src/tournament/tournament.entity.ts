import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export interface TournamentBracketSlot {
  playerAId: string;
  playerBId: string;
  matchId: string | null;
  winnerId: string | null;
}

@Entity("tournaments")
export class TournamentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "varchar", default: "open" })
  status: "open" | "running" | "complete";

  @Column({ default: 8 })
  maxPlayers: number;

  @Column({ type: "text", array: true, default: [] })
  playerIds: string[];

  @Column({ type: "jsonb", default: [] })
  bracket: TournamentBracketSlot[];

  @CreateDateColumn()
  createdAt: Date;
}
