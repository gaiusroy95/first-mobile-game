import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameEventEntity } from "./game-event.entity";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";

@Module({
  imports: [TypeOrmModule.forFeature([GameEventEntity])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
