"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HeroesService", {
    enumerable: true,
    get: function() {
        return HeroesService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _gameengine = require("@battle-formation/game-engine");
const _playersservice = require("../players/players.service");
const _ownedheroentity = require("./owned-hero.entity");
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
/** Same catalog instance the simulation itself uses - see owned-hero.entity.ts for why this isn't a database table. */ const heroManager = new _gameengine.HeroManager();
function upgradeCost(level) {
    return level * 50;
}
let HeroesService = class HeroesService {
    listOwned(playerId) {
        return this.heroes.find({
            where: {
                playerId
            }
        });
    }
    async upgrade(playerId, instanceId) {
        const owned = await this.heroes.findOne({
            where: {
                id: instanceId,
                playerId
            }
        });
        if (!owned) {
            throw new _common.NotFoundException("Hero not found");
        }
        // Throws if heroId doesn't match a real catalog entry - defense in
        // depth against a corrupted row, not a path any normal client can hit.
        heroManager.getDefinition(owned.heroId);
        await this.players.spendGold(playerId, upgradeCost(owned.level));
        owned.level += 1;
        return this.heroes.save(owned);
    }
    constructor(heroes, players){
        this.heroes = heroes;
        this.players = players;
    }
};
HeroesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_ownedheroentity.OwnedHeroEntity)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _playersservice.PlayersService === "undefined" ? Object : _playersservice.PlayersService
    ])
], HeroesService);

//# sourceMappingURL=heroes.service.js.map