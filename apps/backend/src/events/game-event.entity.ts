import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("game_events")
export class GameEventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "timestamptz" })
  startsAt: Date;

  @Column({ type: "timestamptz" })
  endsAt: Date;

  @Column({ type: "jsonb", default: {} })
  rules: Record<string, unknown>;

  @Column({ default: true })
  active: boolean;
}
