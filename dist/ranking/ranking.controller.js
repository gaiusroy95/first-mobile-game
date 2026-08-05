"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RankingController", {
    enumerable: true,
    get: function() {
        return RankingController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../common/jwt-auth.guard");
const _currentplayerdecorator = require("../common/current-player.decorator");
const _rankingservice = require("./ranking.service");
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
let RankingController = class RankingController {
    leaderboard(limit) {
        return this.ranking.getLeaderboard(limit ? Number(limit) : undefined);
    }
    me(player) {
        return this.ranking.getRank(player.playerId);
    }
    constructor(ranking){
        this.ranking = ranking;
    }
};
_ts_decorate([
    (0, _common.Get)("leaderboard"),
    _ts_param(0, (0, _common.Query)("limit")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RankingController.prototype, "leaderboard", null);
_ts_decorate([
    (0, _common.Get)("me"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer
    ]),
    _ts_metadata("design:returntype", void 0)
], RankingController.prototype, "me", null);
RankingController = _ts_decorate([
    (0, _common.Controller)("ranking"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _rankingservice.RankingService === "undefined" ? Object : _rankingservice.RankingService
    ])
], RankingController);

//# sourceMappingURL=ranking.controller.js.map