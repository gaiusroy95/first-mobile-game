import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "../players/player.entity";

/**
 * Ownership/progression only - NOT hero balance data. A hero's stats,
 * class, rarity, and abilities live in @battle-formation/game-engine's
 * heroDatabase (versioned code, imported identically by this backend, the
 * mobile app, and the Phaser bundle), not in Postgres. `heroId` here is a
 * foreign key in spirit only - it references an entry in that in-code
 * database, not another table - so a balance patch is a package release,
 * never a migration, and the three runtimes can never disagree about what
 * a hero's stats are.
 */
@Entity("owned_heroes")
export class OwnedHeroEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  playerId: string;

  @ManyToOne(() => Player, { onDelete: "CASCADE" })
  player: Player;

  @Column()
  heroId: string;

  @Column({ default: 1 })
  level: number;

  @Column("text", { array: true, default: [] })
  upgrades: string[];

  /** Equipped cosmetic skin id (stats-neutral). */
  @Column({ type: "varchar", nullable: true })
  cosmeticId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
