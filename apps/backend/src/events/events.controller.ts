import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { EventsService } from "./events.service";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list() {
    return this.events.listActive();
  }

  @Get("all")
  listAll() {
    return this.events.listAll();
  }
}
