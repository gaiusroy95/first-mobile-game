"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RewardsController", {
    enumerable: true,
    get: function() {
        return RewardsController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../common/jwt-auth.guard");
const _currentplayerdecorator = require("../common/current-player.decorator");
const _rewardsservice = require("./rewards.service");
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
let RewardsController = class RewardsController {
    /** Read-only: what the server already granted. See RewardsService.grantForMatch for where that actually happens. */ get(player, matchId) {
        return this.rewards.getForMatch(matchId, player.playerId);
    }
    constructor(rewards){
        this.rewards = rewards;
    }
};
_ts_decorate([
    (0, _common.Get)(":matchId"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_param(1, (0, _common.Param)("matchId")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RewardsController.prototype, "get", null);
RewardsController = _ts_decorate([
    (0, _common.Controller)("rewards"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _rewardsservice.RewardsService === "undefined" ? Object : _rewardsservice.RewardsService
    ])
], RewardsController);

//# sourceMappingURL=rewards.controller.js.map