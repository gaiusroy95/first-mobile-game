import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import type { BattleEvent, Formation } from "@battle-formation/shared-types";

export type MatchStatus = "pending" | "ready" | "complete";

@Entity("matches")
export class MatchEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  playerAId: string;

  @Index()
  @Column()
  playerBId: string;

  // Explicit `type` because TypeScript's reflected type for a `string |
  // null` union collapses to `Object`, which TypeORM can't map to a SQL
  // column type on its own.
  @Column({ type: "uuid", nullable: true })
  winnerId: string | null;

  /**
   * Stored as a string - TypeORM maps Postgres `bigint` to a JS string by
   * default to avoid silent precision loss above 2^53, since a
   * millisecond timestamp seed comfortably exceeds a 32-bit int.
   */
  @Column({ type: "bigint" })
  seed: string;

  @Column({ type: "jsonb", nullable: true })
  formationA: Formation | null;

  @Column({ type: "jsonb", nullable: true })
  formationB: Formation | null;

  /**
   * The full deterministic event log, inline. Fine at moderate volume;
   * flagged in the scalability write-up as the first thing to move to
   * blob storage (S3 + a lightweight pointer column) once match volume
   * makes this table's row size a problem.
   */
  @Column({ type: "jsonb", nullable: true })
  eventLog: BattleEvent[] | null;

  @Column({ type: "varchar", default: "pending" })
  status: MatchStatus;

  /** casual | ranked | adventure | event | tournament */
  @Column({ type: "varchar", default: "casual" })
  mode: string;

  /**
   * Set at match creation, enforced server-side in BattlesService -
   * without this, the 20s formation timer the client displays (see
   * FormationScene's PrepTimer) would be purely cosmetic. A modified
   * client could just ignore its own countdown and submit whenever it
   * wanted; the server rejecting late submissions is what actually makes
   * the timer mean something.
   */
  @Column({ type: "timestamptz" })
  formationDeadline: Date;

  @CreateDateColumn()
  createdAt: Date;
}
