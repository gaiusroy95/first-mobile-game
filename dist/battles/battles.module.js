"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BattlesModule", {
    enumerable: true,
    get: function() {
        return BattlesModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _ownedheroentity = require("../heroes/owned-hero.entity");
const _rankingmodule = require("../ranking/ranking.module");
const _rewardsmodule = require("../rewards/rewards.module");
const _realtimemodule = require("../realtime/realtime.module");
const _matchentity = require("./match.entity");
const _battlesservice = require("./battles.service");
const _battlescontroller = require("./battles.controller");
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
let BattlesModule = class BattlesModule {
};
BattlesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _matchentity.MatchEntity,
                _ownedheroentity.OwnedHeroEntity
            ]),
            _rankingmodule.RankingModule,
            _rewardsmodule.RewardsModule,
            _realtimemodule.RealtimeModule
        ],
        controllers: [
            _battlescontroller.BattlesController
        ],
        providers: [
            _battlesservice.BattlesService
        ],
        exports: [
            _battlesservice.BattlesService
        ]
    })
], BattlesModule);

//# sourceMappingURL=battles.module.js.map