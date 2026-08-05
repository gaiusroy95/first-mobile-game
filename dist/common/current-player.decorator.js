"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CurrentPlayer", {
    enumerable: true,
    get: function() {
        return CurrentPlayer;
    }
});
const _common = require("@nestjs/common");
const CurrentPlayer = (0, _common.createParamDecorator)((_, ctx)=>{
    return ctx.switchToHttp().getRequest().user;
});

//# sourceMappingURL=current-player.decorator.js.map