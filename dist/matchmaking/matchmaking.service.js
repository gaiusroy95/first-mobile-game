"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchmakingService", {
    enumerable: true,
    get: function() {
        return MatchmakingService;
    }
});
const _common = require("@nestjs/common");
const _playersservice = require("../players/players.service");
const _battlesservice = require("../battles/battles.service");
const _realtimegateway = require("../realtime/realtime.gateway");
const _redismodule = require("../common/redis.module");
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
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
const QUEUE_KEY = "matchmaking:queue";
/** How far apart two players' trophy counts can be and still be paired. */ const RATING_WINDOW = 100;
let MatchmakingService = class MatchmakingService {
    /**
   * Redis ZSET (score = trophies) is what makes this queue correct under
   * horizontal scaling: every backend instance reads and writes the same
   * queue, so it doesn't matter which instance either player's join
   * request lands on. Not fully race-proof under concurrent joins (see the
   * ZREM check below) - a dedicated single-consumer matchmaking worker is
   * the documented next step once concurrent join volume makes that
   * matter (see the scalability notes).
   */ async joinQueue(playerId) {
        const profile = await this.players.findById(playerId);
        const client = this.redis.client;
        const candidates = await client.zrangebyscore(QUEUE_KEY, profile.trophies - RATING_WINDOW, profile.trophies + RATING_WINDOW, "LIMIT", 0, 1);
        const opponentId = candidates[0];
        if (!opponentId) {
            await client.zadd(QUEUE_KEY, profile.trophies, playerId);
            return {
                status: "queued"
            };
        }
        const removed = await client.zrem(QUEUE_KEY, opponentId);
        if (removed === 0) {
            // Another instance matched this opponent between our read and this
            // removal - fall back to queueing ourselves rather than risk
            // double-matching the same opponent.
            await client.zadd(QUEUE_KEY, profile.trophies, playerId);
            return {
                status: "queued"
            };
        }
        const match = await this.battles.createMatch(playerId, opponentId);
        const toPlayer = {
            matchId: match.id,
            opponentId
        };
        const toOpponent = {
            matchId: match.id,
            opponentId: playerId
        };
        this.realtime.emitToPlayer(playerId, "matchmaking:found", toPlayer);
        this.realtime.emitToPlayer(opponentId, "matchmaking:found", toOpponent);
        return {
            status: "matched",
            matchId: match.id
        };
    }
    async leaveQueue(playerId) {
        await this.redis.client.zrem(QUEUE_KEY, playerId);
    }
    constructor(redis, players, battles, realtime){
        this.redis = redis;
        this.players = players;
        this.battles = battles;
        this.realtime = realtime;
    }
};
MatchmakingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _redismodule.RedisService === "undefined" ? Object : _redismodule.RedisService,
        typeof _playersservice.PlayersService === "undefined" ? Object : _playersservice.PlayersService,
        typeof _battlesservice.BattlesService === "undefined" ? Object : _battlesservice.BattlesService,
        typeof _realtimegateway.RealtimeGateway === "undefined" ? Object : _realtimegateway.RealtimeGateway
    ])
], MatchmakingService);

//# sourceMappingURL=matchmaking.service.js.map