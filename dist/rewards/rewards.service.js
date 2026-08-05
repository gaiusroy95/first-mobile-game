"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RewardsService", {
    enumerable: true,
    get: function() {
        return RewardsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _playerentity = require("../players/player.entity");
const _rewardentity = require("./reward.entity");
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
const WIN_REWARD = {
    gold: 100,
    experience: 50
};
const LOSS_REWARD = {
    gold: 25,
    experience: 10
};
/** Postgres unique_violation - see reward.entity.ts. */ const UNIQUE_VIOLATION = "23505";
let RewardsService = class RewardsService {
    /**
   * Called exactly once by BattlesService right after a match resolves -
   * there is no client-facing "claim" action. A reward is a direct,
   * automatic consequence of the server computing a winner, never
   * something a client can request, time, or replay for a second payout.
   */ async grantForMatch(match) {
        return {
            playerA: await this.grant(match, match.playerAId),
            playerB: await this.grant(match, match.playerBId)
        };
    }
    async grant(match, playerId) {
        const existing = await this.rewards.findOne({
            where: {
                matchId: match.id,
                playerId
            }
        });
        if (existing) return existing;
        const reward = match.winnerId === playerId ? WIN_REWARD : LOSS_REWARD;
        try {
            // The reward row and the gold credit commit together or not at all.
            return await this.dataSource.transaction(async (manager)=>{
                const saved = await manager.save(_rewardentity.RewardEntity, {
                    matchId: match.id,
                    playerId,
                    ...reward
                });
                await manager.increment(_playerentity.Player, {
                    id: playerId
                }, "gold", reward.gold);
                return saved;
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                // grantForMatch ran twice for this match (shouldn't happen given
                // the status guard in BattlesService, but the constraint - not
                // this catch - is the actual guarantee) - return what was already
                // granted instead of granting again.
                return this.rewards.findOneByOrFail({
                    matchId: match.id,
                    playerId
                });
            }
            throw error;
        }
    }
    getForMatch(matchId, playerId) {
        return this.rewards.findOne({
            where: {
                matchId,
                playerId
            }
        });
    }
    constructor(rewards, dataSource){
        this.rewards = rewards;
        this.dataSource = dataSource;
    }
};
RewardsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_rewardentity.RewardEntity)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.DataSource === "undefined" ? Object : _typeorm1.DataSource
    ])
], RewardsService);
function isUniqueViolation(error) {
    return typeof error === "object" && error !== null && "code" in error && error.code === UNIQUE_VIOLATION;
}

//# sourceMappingURL=rewards.service.js.map