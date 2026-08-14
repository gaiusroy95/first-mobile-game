import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { RedisIoAdapter } from "./common/redis-io.adapter";
import { RedisService } from "./common/redis.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger("Bootstrap");
  const redis = app.get(RedisService);
  const redisUrl = config.getOrThrow<string>("REDIS_URL");

  if (!redis.usingMemoryFallback && redisUrl !== "memory" && !redisUrl.startsWith("memory://")) {
    try {
      const redisAdapter = new RedisIoAdapter(app);
      await redisAdapter.connectToRedis(redisUrl);
      app.useWebSocketAdapter(redisAdapter);
    } catch (error) {
      logger.warn(
        `Redis Socket.IO adapter unavailable — single-process sockets only (${error instanceof Error ? error.message : "error"})`
      );
    }
  } else {
    logger.warn("Skipping Redis Socket.IO adapter (in-memory / local Practice mode)");
  }

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Without this, entity fields marked @Exclude() (passwordHash) are
  // returned as-is - found by actually calling the API and seeing the
  // hash come back, not by inspection.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = config.get<number>("PORT") ?? 3000;
  await app.listen(port);
  console.log(`battle-formation backend listening on :${port}`);
}

bootstrap();
