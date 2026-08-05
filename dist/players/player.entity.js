"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Player", {
    enumerable: true,
    get: function() {
        return Player;
    }
});
const _classtransformer = require("class-transformer");
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
let Player = class Player {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)("uuid"),
    _ts_metadata("design:type", String)
], Player.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        unique: true
    }),
    _ts_metadata("design:type", String)
], Player.prototype, "username", void 0);
_ts_decorate([
    (0, _classtransformer.Exclude)(),
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Player.prototype, "passwordHash", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Player.prototype, "displayName", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 1
    }),
    _ts_metadata("design:type", Number)
], Player.prototype, "level", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 0
    }),
    _ts_metadata("design:type", Number)
], Player.prototype, "xp", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 300
    }),
    _ts_metadata("design:type", Number)
], Player.prototype, "gold", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 0
    }),
    _ts_metadata("design:type", Number)
], Player.prototype, "gems", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: 0
    }),
    _ts_metadata("design:type", Number)
], Player.prototype, "trophies", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Player.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Player.prototype, "updatedAt", void 0);
Player = _ts_decorate([
    (0, _typeorm.Entity)("players")
], Player);

//# sourceMappingURL=player.entity.js.map