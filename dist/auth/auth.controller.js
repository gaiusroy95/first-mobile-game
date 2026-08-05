"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const _dto = require("./dto");
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
let AuthController = class AuthController {
    register(dto) {
        return this.auth.register(dto.username, dto.password, dto.displayName);
    }
    login(dto) {
        return this.auth.login(dto.username, dto.password);
    }
    constructor(auth){
        this.auth = auth;
    }
};
_ts_decorate([
    (0, _common.Post)("register"),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.RegisterDto === "undefined" ? Object : _dto.RegisterDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _common.Post)("login"),
    (0, _common.HttpCode)(200),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.LoginDto === "undefined" ? Object : _dto.LoginDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
AuthController = _ts_decorate([
    (0, _common.Controller)("auth"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map