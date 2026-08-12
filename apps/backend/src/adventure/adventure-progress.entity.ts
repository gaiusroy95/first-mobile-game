import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("adventure_progress")
@Unique(["playerId"])
export class AdventureProgressEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  playerId: string;

  @Column({ default: 0 })
  highestCleared: number;
}
