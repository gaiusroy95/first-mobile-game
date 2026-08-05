"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlayersModule", {
    enumerable: true,
    get: function() {
        return PlayersModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _playerentity = require("./player.entity");
const _playersservice = require("./players.service");
const _playerscontroller = require("./players.controller");
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
let PlayersModule = class PlayersModule {
};
PlayersModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _playerentity.Player
            ])
        ],
        controllers: [
            _playerscontroller.PlayersController
        ],
        providers: [
            _playersservice.PlayersService
        ],
        exports: [
            _playersservice.PlayersService
        ]
    })
], PlayersModule);

//# sourceMappingURL=players.module.js.map