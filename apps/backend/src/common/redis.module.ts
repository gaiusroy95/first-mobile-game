import { Global, Injectable, Logger, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis, { type Redis } from "ioredis";
import { MemoryRedis } from "./memory-redis";

export type RedisLike = Redis | MemoryRedis;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: RedisLike;
  readonly usingMemoryFallback: boolean;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>("REDIS_URL");
    const allowMemory = config.get<string>("REDIS_MEMORY_FALLBACK") === "true" || config.get<string>("NODE_ENV") === "development";

    if (allowMemory && (url === "memory" || url.startsWith("memory://"))) {
      this.logger.warn("Using in-memory Redis fallback (REDIS_URL=memory)");
      this.client = new MemoryRedis();
      this.usingMemoryFallback = true;
      return;
    }

    try {
      const client = new IORedis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 1500,
        retryStrategy: () => null,
      });
      client.on("error", (error) => this.logger.error(`Redis connection error: ${error.message}`));
      this.client = client;
      this.usingMemoryFallback = false;
    } catch (error) {
      if (!allowMemory) throw error;
      this.logger.warn(`Redis unavailable — using in-memory fallback (${error instanceof Error ? error.message : "error"})`);
      this.client = new MemoryRedis();
      this.usingMemoryFallback = true;
    }
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
