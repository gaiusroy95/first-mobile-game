import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { RedisIoAdapter } from "./common/redis-io.adapter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis(config.getOrThrow<string>("REDIS_URL"));
  app.useWebSocketAdapter(redisAdapter);

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
