import { Global, Injectable, Logger, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis, { Redis } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new IORedis(config.getOrThrow<string>("REDIS_URL"));
    // ioredis retries forever by default and, with no 'error' listener,
    // node's EventEmitter would throw and crash the process on the first
    // failed attempt - it doesn't, specifically because ioredis detects an
    // unhandled 'error' listener and swallows it into a console warning
    // instead. That's what "missing 'error' handler" spam actually is:
    // real connection failures, logged once per retry, forever, with no
    // way to tell if it's still happening. A real handler makes failures
    // visible without the process going down over something recoverable
    // (a brief network blip, Redis restarting).
    this.client.on("error", (error) => this.logger.error(`Redis connection error: ${error.message}`));
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}

/**
 * Global so every feature module (matchmaking's queue, ranking's leaderboard
 * cache) can inject one shared Redis connection without each importing this
 * module explicitly.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
