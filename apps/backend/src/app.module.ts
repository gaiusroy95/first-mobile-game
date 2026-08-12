import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { backendEnvSchema } from "@battle-formation/config";
import { HealthController } from "./health.controller";
import { RedisModule } from "./common/redis.module";
import { AuthModule } from "./auth/auth.module";
import { PlayersModule } from "./players/players.module";
import { HeroesModule } from "./heroes/heroes.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { MatchmakingModule } from "./matchmaking/matchmaking.module";
import { BattlesModule } from "./battles/battles.module";
import { RankingModule } from "./ranking/ranking.module";
import { RewardsModule } from "./rewards/rewards.module";
import { AdventureModule } from "./adventure/adventure.module";
import { EventsModule } from "./events/events.module";
import { TournamentModule } from "./tournament/tournament.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => backendEnvSchema.parse(config),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.getOrThrow<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: config.get<string>("NODE_ENV") !== "production",
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    RedisModule,
    AuthModule,
    PlayersModule,
    HeroesModule,
    RealtimeModule,
    MatchmakingModule,
    BattlesModule,
    RankingModule,
    RewardsModule,
    AdventureModule,
    EventsModule,
    TournamentModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
