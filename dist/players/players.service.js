"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlayersService", {
    enumerable: true,
    get: function() {
        return PlayersService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _playerentity = require("./player.entity");
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
let PlayersService = class PlayersService {
    findById(playerId) {
        return this.players.findOneByOrFail({
            id: playerId
        });
    }
    updateProfile(playerId, changes) {
        return this.players.save({
            id: playerId,
            ...changes
        });
    }
    async addGold(playerId, amount) {
        await this.players.increment({
            id: playerId
        }, "gold", amount);
    }
    /** Throws if the player can't afford it - callers don't need to check the balance themselves first. */ async spendGold(playerId, amount) {
        const player = await this.findById(playerId);
        if (player.gold < amount) {
            throw new _common.BadRequestException("Not enough gold");
        }
        await this.players.decrement({
            id: playerId
        }, "gold", amount);
    }
    constructor(players){
        this.players = players;
    }
};
PlayersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_playerentity.Player)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], PlayersService);

//# sourceMappingURL=players.service.js.map