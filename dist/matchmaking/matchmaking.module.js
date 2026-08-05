"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchmakingModule", {
    enumerable: true,
    get: function() {
        return MatchmakingModule;
    }
});
const _common = require("@nestjs/common");
const _playersmodule = require("../players/players.module");
const _battlesmodule = require("../battles/battles.module");
const _realtimemodule = require("../realtime/realtime.module");
const _matchmakingservice = require("./matchmaking.service");
const _matchmakingcontroller = require("./matchmaking.controller");
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
let MatchmakingModule = class MatchmakingModule {
};
MatchmakingModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _playersmodule.PlayersModule,
            _battlesmodule.BattlesModule,
            _realtimemodule.RealtimeModule
        ],
        controllers: [
            _matchmakingcontroller.MatchmakingController
        ],
        providers: [
            _matchmakingservice.MatchmakingService
        ]
    })
], MatchmakingModule);

//# sourceMappingURL=matchmaking.module.js.map