"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _config = require("@nestjs/config");
const _typeorm = require("@nestjs/typeorm");
const _throttler = require("@nestjs/throttler");
const _config1 = require("@battle-formation/config");
const _healthcontroller = require("./health.controller");
const _redismodule = require("./common/redis.module");
const _authmodule = require("./auth/auth.module");
const _playersmodule = require("./players/players.module");
const _heroesmodule = require("./heroes/heroes.module");
const _realtimemodule = require("./realtime/realtime.module");
const _matchmakingmodule = require("./matchmaking/matchmaking.module");
const _battlesmodule = require("./battles/battles.module");
const _rankingmodule = require("./ranking/ranking.module");
const _rewardsmodule = require("./rewards/rewards.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true,
                validate: (config)=>_config1.backendEnvSchema.parse(config)
            }),
            _typeorm.TypeOrmModule.forRootAsync({
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>({
                        type: "postgres",
                        url: config.getOrThrow("DATABASE_URL"),
                        autoLoadEntities: true,
                        // Dev convenience only - schema changes in production go through
                        // migrations (`typeorm migration:generate`/`:run`), never
                        // synchronize, which can silently drop columns on a mismatch.
                        synchronize: config.get("NODE_ENV") !== "production"
                    })
            }),
            _throttler.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 100
                }
            ]),
            _redismodule.RedisModule,
            _authmodule.AuthModule,
            _playersmodule.PlayersModule,
            _heroesmodule.HeroesModule,
            _realtimemodule.RealtimeModule,
            _matchmakingmodule.MatchmakingModule,
            _battlesmodule.BattlesModule,
            _rankingmodule.RankingModule,
            _rewardsmodule.RewardsModule
        ],
        controllers: [
            _healthcontroller.HealthController
        ],
        providers: [
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map