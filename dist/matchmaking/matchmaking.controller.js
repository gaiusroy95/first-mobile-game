"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchmakingController", {
    enumerable: true,
    get: function() {
        return MatchmakingController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _jwtauthguard = require("../common/jwt-auth.guard");
const _currentplayerdecorator = require("../common/current-player.decorator");
const _matchmakingservice = require("./matchmaking.service");
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
let MatchmakingController = class MatchmakingController {
    // Tighter than the global default (see AppModule) - joining repeatedly
    // in a tight loop is the only way a client could try to game pairing
    // (e.g. spamming joins hoping to land next to a specific opponent).
    join(player) {
        return this.matchmaking.joinQueue(player.playerId);
    }
    leave(player) {
        return this.matchmaking.leaveQueue(player.playerId);
    }
    constructor(matchmaking){
        this.matchmaking = matchmaking;
    }
};
_ts_decorate([
    (0, _throttler.Throttle)({
        default: {
            limit: 5,
            ttl: 10_000
        }
    }),
    (0, _common.Post)("queue"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer
    ]),
    _ts_metadata("design:returntype", void 0)
], MatchmakingController.prototype, "join", null);
_ts_decorate([
    (0, _common.Delete)("queue"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer
    ]),
    _ts_metadata("design:returntype", void 0)
], MatchmakingController.prototype, "leave", null);
MatchmakingController = _ts_decorate([
    (0, _common.Controller)("matchmaking"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _matchmakingservice.MatchmakingService === "undefined" ? Object : _matchmakingservice.MatchmakingService
    ])
], MatchmakingController);

//# sourceMappingURL=matchmaking.controller.js.map