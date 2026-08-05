"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BattlesController", {
    enumerable: true,
    get: function() {
        return BattlesController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _jwtauthguard = require("../common/jwt-auth.guard");
const _currentplayerdecorator = require("../common/current-player.decorator");
const _battlesservice = require("./battles.service");
const _dto = require("./dto");
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
let BattlesController = class BattlesController {
    // The status/deadline/lock guards in BattlesService already make repeat
    // submissions a no-op past the first, valid one - this throttle just
    // keeps a spam loop from generating load (DB transactions, lock
    // contention) for no effect.
    submitFormation(player, matchId, dto) {
        return this.battles.submitFormation(matchId, player.playerId, dto.formation);
    }
    constructor(battles){
        this.battles = battles;
    }
};
_ts_decorate([
    (0, _throttler.Throttle)({
        default: {
            limit: 10,
            ttl: 10_000
        }
    }),
    (0, _common.Post)(":matchId/formation"),
    (0, _common.HttpCode)(204),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_param(1, (0, _common.Param)("matchId")),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer,
        String,
        typeof _dto.SubmitFormationDto === "undefined" ? Object : _dto.SubmitFormationDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BattlesController.prototype, "submitFormation", null);
BattlesController = _ts_decorate([
    (0, _common.Controller)("battles"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _battlesservice.BattlesService === "undefined" ? Object : _battlesservice.BattlesService
    ])
], BattlesController);

//# sourceMappingURL=battles.controller.js.map