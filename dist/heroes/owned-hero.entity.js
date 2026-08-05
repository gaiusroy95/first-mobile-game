"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OwnedHeroEntity", {
    enumerable: true,
    get: function() {
        return OwnedHeroEntity;
    }
});
const _typeorm = require("typeorm");
const _playerentity = require("../players/player.entity");
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
let OwnedHeroEntity = class OwnedHeroEntity {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)("uuid"),
    _ts_metadata("design:type", String)
], OwnedHeroEntity.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Index)(),
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], OwnedHeroEntity.prototype, "playerId", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_playerentity.Player, {
        onDelete: "CASCADE"
    }),
    _ts_metadata("design:type", typeof _playerentity.Player === "undefined" ? Object : _playerentity.Player)
], OwnedHeroEntity.prototype, "player", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], OwnedHeroEntity.prototype, "heroId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 1
    }),
    _ts_metadata("design:type", Number)
], OwnedHeroEntity.prototype, "level", void 0);
_ts_decorate([
    (0, _typeorm.Column)("text", {
        array: true,
        default: []
    }),
    _ts_metadata("design:type", Array)
], OwnedHeroEntity.prototype, "upgrades", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], OwnedHeroEntity.prototype, "createdAt", void 0);
OwnedHeroEntity = _ts_decorate([
    (0, _typeorm.Entity)("owned_heroes")
], OwnedHeroEntity);

//# sourceMappingURL=owned-hero.entity.js.map