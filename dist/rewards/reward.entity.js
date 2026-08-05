"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RewardEntity", {
    enumerable: true,
    get: function() {
        return RewardEntity;
    }
});
const _typeorm = require("typeorm");
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
let RewardEntity = class RewardEntity {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)("uuid"),
    _ts_metadata("design:type", String)
], RewardEntity.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], RewardEntity.prototype, "matchId", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], RewardEntity.prototype, "playerId", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", Number)
], RewardEntity.prototype, "gold", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", Number)
], RewardEntity.prototype, "experience", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RewardEntity.prototype, "grantedAt", void 0);
RewardEntity = _ts_decorate([
    (0, _typeorm.Entity)("match_rewards"),
    (0, _typeorm.Unique)([
        "matchId",
        "playerId"
    ])
], RewardEntity);

//# sourceMappingURL=reward.entity.js.map