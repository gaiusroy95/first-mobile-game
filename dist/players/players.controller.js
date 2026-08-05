"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlayersController", {
    enumerable: true,
    get: function() {
        return PlayersController;
    }
});
const _common = require("@nestjs/common");
const _classvalidator = require("class-validator");
const _jwtauthguard = require("../common/jwt-auth.guard");
const _currentplayerdecorator = require("../common/current-player.decorator");
const _playersservice = require("./players.service");
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
let UpdateProfileDto = class UpdateProfileDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(24),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "displayName", void 0);
let PlayersController = class PlayersController {
    getMe(player) {
        return this.players.findById(player.playerId);
    }
    updateMe(player, dto) {
        return this.players.updateProfile(player.playerId, dto);
    }
    constructor(players){
        this.players = players;
    }
};
_ts_decorate([
    (0, _common.Get)("me"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer
    ]),
    _ts_metadata("design:returntype", void 0)
], PlayersController.prototype, "getMe", null);
_ts_decorate([
    (0, _common.Patch)("me"),
    _ts_param(0, (0, _currentplayerdecorator.CurrentPlayer)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AuthenticatedPlayer === "undefined" ? Object : AuthenticatedPlayer,
        typeof UpdateProfileDto === "undefined" ? Object : UpdateProfileDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PlayersController.prototype, "updateMe", null);
PlayersController = _ts_decorate([
    (0, _common.Controller)("players"),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _playersservice.PlayersService === "undefined" ? Object : _playersservice.PlayersService
    ])
], PlayersController);

//# sourceMappingURL=players.controller.js.map