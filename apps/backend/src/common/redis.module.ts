import { Global, Injectable, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis, { Redis } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new IORedis(config.getOrThrow<string>("REDIS_URL"));
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
