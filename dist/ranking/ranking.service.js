"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RankingService", {
    enumerable: true,
    get: function() {
        return RankingService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _playerentity = require("../players/player.entity");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const LEADERBOARD_KEY = "ranking:leaderboard";
const TROPHY_DELTA_WIN = 25;
const TROPHY_DELTA_LOSS = -15;
const DEFAULT_LEADERBOARD_LIMIT = 50;
let RankingService = class RankingService {
    async applyMatchResult(playerAId, playerBId, winnerId) {
        const loserId = winnerId === playerAId ? playerBId : playerAId;
        await this.adjustTrophies(winnerId, TROPHY_DELTA_WIN);
        await this.adjustTrophies(loserId, TROPHY_DELTA_LOSS);
    }
    /** Postgres stays the source of truth (survives a Redis flush); the ZSET is a write-through cache that makes leaderboard reads never touch the database. */ async adjustTrophies(playerId, delta) {
        await this.players.increment({
            id: playerId
        }, "trophies", delta);
        const player = await this.players.findOneByOrFail({
            id: playerId
        });
        const trophies = Math.max(0, player.trophies);
        if (trophies !== player.trophies) {
            await this.players.update({
                id: playerId
            }, {
                trophies
            });
        }
        await this.redis.client.zadd(LEADERBOARD_KEY, trophies, playerId);
    }
    async getLeaderboard(limit = DEFAULT_LEADERBOARD_LIMIT) {
        const entries = await this.redis.client.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");
        const playerIds = [];
        const trophiesByPlayerId = new Map();
        for(let i = 0; i < entries.length; i += 2){
            const playerId = entries[i];
            const rawTrophies = entries[i + 1];
            if (playerId === undefined || rawTrophies === undefined) continue;
            playerIds.push(playerId);
            trophiesByPlayerId.set(playerId, Number(rawTrophies));
        }
        if (playerIds.length === 0) return [];
        const players = await this.players.find({
            where: {
                id: (0, _typeorm1.In)(playerIds)
            }
        });
        const displayNameByPlayerId = new Map(players.map((player)=>[
                player.id,
                player.displayName
            ]));
        return playerIds.map((playerId, index)=>({
                playerId,
                displayName: displayNameByPlayerId.get(playerId) ?? "Unknown",
                trophies: trophiesByPlayerId.get(playerId) ?? 0,
                rank: index + 1
            }));
    }
    async getRank(playerId) {
        const [rank, trophies] = await Promise.all([
            this.redis.client.zrevrank(LEADERBOARD_KEY, playerId),
            this.redis.client.zscore(LEADERBOARD_KEY, playerId)
        ]);
        return {
            rank: rank === null ? null : rank + 1,
            trophies: trophies ? Number(trophies) : 0
        };
    }
    constructor(players, redis){
        this.players = players;
        this.redis = redis;
    }
};
RankingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_playerentity.Player)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _redismodule.RedisService === "undefined" ? Object : _redismodule.RedisService
    ])
], RankingService);

//# sourceMappingURL=ranking.service.js.map