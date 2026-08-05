"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _typeorm = require("@nestjs/typeorm");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _typeorm1 = require("typeorm");
const _playerentity = require("../players/player.entity");
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
const PASSWORD_SALT_ROUNDS = 10;
let AuthService = class AuthService {
    async register(username, password, displayName) {
        const existing = await this.players.findOne({
            where: {
                username
            }
        });
        if (existing) {
            throw new _common.ConflictException("Username already taken");
        }
        const passwordHash = await _bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
        const player = await this.players.save(this.players.create({
            username,
            passwordHash,
            displayName
        }));
        return this.issueSession(player);
    }
    async login(username, password) {
        const player = await this.players.findOne({
            where: {
                username
            }
        });
        if (!player || !await _bcrypt.compare(password, player.passwordHash)) {
            throw new _common.UnauthorizedException("Invalid credentials");
        }
        return this.issueSession(player);
    }
    issueSession(player) {
        return {
            token: this.jwt.sign({
                sub: player.id
            }),
            playerId: player.id,
            displayName: player.displayName
        };
    }
    constructor(players, jwt){
        this.players = players;
        this.jwt = jwt;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_playerentity.Player)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map