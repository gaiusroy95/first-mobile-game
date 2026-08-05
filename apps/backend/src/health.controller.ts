import { Controller, Get } from "@nestjs/common";

/** No auth, no DB/Redis dependency - exists purely so a host (Render, a load balancer) can confirm the process is up and serving HTTP. */
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
