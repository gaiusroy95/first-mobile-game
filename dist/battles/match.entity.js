"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchEntity", {
    enumerable: true,
    get: function() {
        return MatchEntity;
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
let MatchEntity = class MatchEntity {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)("uuid"),
    _ts_metadata("design:type", String)
], MatchEntity.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Index)(),
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], MatchEntity.prototype, "playerAId", void 0);
_ts_decorate([
    (0, _typeorm.Index)(),
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], MatchEntity.prototype, "playerBId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "uuid",
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], MatchEntity.prototype, "winnerId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "bigint"
    }),
    _ts_metadata("design:type", String)
], MatchEntity.prototype, "seed", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "jsonb",
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], MatchEntity.prototype, "formationA", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "jsonb",
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], MatchEntity.prototype, "formationB", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "jsonb",
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], MatchEntity.prototype, "eventLog", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "varchar",
        default: "pending"
    }),
    _ts_metadata("design:type", typeof MatchStatus === "undefined" ? Object : MatchStatus)
], MatchEntity.prototype, "status", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: "timestamptz"
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], MatchEntity.prototype, "formationDeadline", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], MatchEntity.prototype, "createdAt", void 0);
MatchEntity = _ts_decorate([
    (0, _typeorm.Entity)("matches")
], MatchEntity);

//# sourceMappingURL=match.entity.js.map