import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("players")
export class Player {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  // @Exclude only takes effect where the app actually serializes through
  // class-transformer (ClassSerializerInterceptor, wired globally in
  // main.ts) - found this was NOT happening by actually calling GET
  // /players/me and seeing the bcrypt hash come back in the response.
  @Exclude()
  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 300 })
  gold: number;

  @Column({ default: 100 })
  gems: number;

  /** Source of truth for ranking; ranking.service.ts mirrors this into a Redis ZSET for fast leaderboard reads. */
  @Column({ default: 0 })
  trophies: number;

  /** Hero card counts keyed by catalog heroId. */
  @Column({ type: "jsonb", default: {} })
  heroCards: Record<string, number>;

  /** Upgrade material counts keyed by material id. */
  @Column({ type: "jsonb", default: {} })
  materials: Record<string, number>;

  /** Unlocked cosmetic skin ids the player owns. */
  @Column({ type: "text", array: true, default: [] })
  ownedCosmetics: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
