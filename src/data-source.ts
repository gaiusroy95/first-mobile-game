import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Player } from "./players/player.entity";
import { OwnedHeroEntity } from "./heroes/owned-hero.entity";
import { MatchEntity } from "./battles/match.entity";
import { RewardEntity } from "./rewards/reward.entity";

dotenv.config();

/**
 * Used by the TypeORM CLI only (`npm run migration:generate` /
 * `migration:run`, both invoked via `typeorm-ts-node-commonjs` so this
 * file runs the same way in dev and in a deploy step - never imported by
 * the running app itself, which gets its connection through
 * AppModule's TypeOrmModule.forRootAsync instead. Two config objects,
 * same entities and same DATABASE_URL, because the app boots through
 * Nest's DI and the CLI needs a plain DataSource - there's no single
 * NestJS API that serves both.
 */
export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Player, OwnedHeroEntity, MatchEntity, RewardEntity],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
});
