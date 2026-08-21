import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameEventEntity } from "./game-event.entity";

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(@InjectRepository(GameEventEntity) private readonly events: Repository<GameEventEntity>) {}

  async onModuleInit(): Promise<void> {
    const count = await this.events.count();
    if (count > 0) return;
    const now = Date.now();
    await this.events.save([
      this.events.create({
        slug: "double-gold-weekend",
        title: "Double Gold Weekend",
        description: "Win rewards grant bonus gold while this event is live.",
        startsAt: new Date(now - 86400000),
        endsAt: new Date(now + 7 * 86400000),
        rules: { goldMultiplier: 2 },
        active: true,
      }),
      this.events.create({
        slug: "frost-front",
        title: "Frost Front",
        description: "Ice Mage skills last longer during this event.",
        startsAt: new Date(now - 3600000),
        endsAt: new Date(now + 3 * 86400000),
        rules: { freezeDurationBonus: 1 },
        active: true,
      }),
    ]);
  }

  listActive(): Promise<GameEventEntity[]> {
    const now = new Date();
    return this.events
      .createQueryBuilder("event")
      .where("event.active = true")
      .andWhere("event.startsAt <= :now", { now })
      .andWhere("event.endsAt >= :now", { now })
      .getMany();
  }

  listAll(): Promise<GameEventEntity[]> {
    return this.events.find({ order: { startsAt: "DESC" } });
  }
}
