import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785943819452 implements MigrationInterface {
    name = 'InitialSchema1785943819452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "displayName" character varying NOT NULL, "level" integer NOT NULL DEFAULT '1', "xp" integer NOT NULL DEFAULT '0', "gold" integer NOT NULL DEFAULT '300', "gems" integer NOT NULL DEFAULT '0', "trophies" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0ba988c87a279b5067d273c5924" UNIQUE ("username"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "owned_heroes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "heroId" character varying NOT NULL, "level" integer NOT NULL DEFAULT '1', "upgrades" text array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02670a49393a2620b2f612c3f2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9305b911528d224f604d870055" ON "owned_heroes" ("playerId") `);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerAId" character varying NOT NULL, "playerBId" character varying NOT NULL, "winnerId" uuid, "seed" bigint NOT NULL, "formationA" jsonb, "formationB" jsonb, "eventLog" jsonb, "status" character varying NOT NULL DEFAULT 'pending', "formationDeadline" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26ceaa5487f4558830c28664f4" ON "matches" ("playerAId") `);
        await queryRunner.query(`CREATE INDEX "IDX_50f3ca94378ae6b292966c8c52" ON "matches" ("playerBId") `);
        await queryRunner.query(`CREATE TABLE "match_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matchId" character varying NOT NULL, "playerId" character varying NOT NULL, "gold" integer NOT NULL, "experience" integer NOT NULL, "grantedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b936a4f4e0cacc0cf29d25f04c8" UNIQUE ("matchId", "playerId"), CONSTRAINT "PK_eb167ff1d2b8ee7a84c40c8b5ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "owned_heroes" ADD CONSTRAINT "FK_9305b911528d224f604d8700553" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "owned_heroes" DROP CONSTRAINT "FK_9305b911528d224f604d8700553"`);
        await queryRunner.query(`DROP TABLE "match_rewards"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50f3ca94378ae6b292966c8c52"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26ceaa5487f4558830c28664f4"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9305b911528d224f604d870055"`);
        await queryRunner.query(`DROP TABLE "owned_heroes"`);
        await queryRunner.query(`DROP TABLE "players"`);
    }

}
