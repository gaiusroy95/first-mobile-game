"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, /**
 * Used by the TypeORM CLI only (`npm run migration:generate` /
 * `migration:run`, both invoked via `typeorm-ts-node-commonjs` so this
 * file runs the same way in dev and in a deploy step - never imported by
 * the running app itself, which gets its connection through
 * AppModule's TypeOrmModule.forRootAsync instead. Two config objects,
 * same entities and same DATABASE_URL, because the app boots through
 * Nest's DI and the CLI needs a plain DataSource - there's no single
 * NestJS API that serves both.
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
require("reflect-metadata");
const _dotenv = /*#__PURE__*/ _interop_require_wildcard(require("dotenv"));
const _typeorm = require("typeorm");
const _playerentity = require("./players/player.entity");
const _ownedheroentity = require("./heroes/owned-hero.entity");
const _matchentity = require("./battles/match.entity");
const _rewardentity = require("./rewards/reward.entity");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
_dotenv.config();
const _default = new _typeorm.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
        _playerentity.Player,
        _ownedheroentity.OwnedHeroEntity,
        _matchentity.MatchEntity,
        _rewardentity.RewardEntity
    ],
    migrations: [
        "src/migrations/*.ts"
    ],
    synchronize: false
});

//# sourceMappingURL=data-source.js.map