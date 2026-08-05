"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HeroesModule", {
    enumerable: true,
    get: function() {
        return HeroesModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _playersmodule = require("../players/players.module");
const _ownedheroentity = require("./owned-hero.entity");
const _heroesservice = require("./heroes.service");
const _heroescontroller = require("./heroes.controller");
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
let HeroesModule = class HeroesModule {
};
HeroesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _ownedheroentity.OwnedHeroEntity
            ]),
            _playersmodule.PlayersModule
        ],
        controllers: [
            _heroescontroller.HeroesController
        ],
        providers: [
            _heroesservice.HeroesService
        ],
        exports: [
            _heroesservice.HeroesService
        ]
    })
], HeroesModule);

//# sourceMappingURL=heroes.module.js.map