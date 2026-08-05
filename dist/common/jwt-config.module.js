"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JwtConfigModule", {
    enumerable: true,
    get: function() {
        return JwtConfigModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _jwt = require("@nestjs/jwt");
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
let JwtConfigModule = class JwtConfigModule {
};
JwtConfigModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _jwt.JwtModule.registerAsync({
                imports: [
                    _config.ConfigModule
                ],
                inject: [
                    _config.ConfigService
                ],
                global: true,
                useFactory: (config)=>({
                        secret: config.getOrThrow("JWT_SECRET"),
                        signOptions: {
                            expiresIn: config.get("JWT_EXPIRES_IN") ?? "7d"
                        }
                    })
            })
        ],
        exports: [
            _jwt.JwtModule
        ]
    })
], JwtConfigModule);

//# sourceMappingURL=jwt-config.module.js.map