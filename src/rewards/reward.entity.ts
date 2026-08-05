import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * One row per (match, player), written exactly once by BattlesService the
 * moment a match resolves - never by a client-initiated request. The
 * Unique constraint, not a read-check in the service, is what actually
 * guarantees a player can never be granted a reward for the same match
 * twice, even under a concurrent/duplicate call to grantForMatch.
 */
@Entity("match_rewards")
@Unique(["matchId", "playerId"])
export class RewardEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  matchId: string;

  @Column()
  playerId: string;

  @Column()
  gold: number;

  @Column()
  experience: number;

  @CreateDateColumn()
  grantedAt: Date;
}
