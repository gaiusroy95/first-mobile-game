"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RealtimeGateway", {
    enumerable: true,
    get: function() {
        return RealtimeGateway;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _websockets = require("@nestjs/websockets");
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
let RealtimeGateway = class RealtimeGateway {
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) throw new Error("Missing token");
            const payload = this.jwt.verify(token);
            client.data.playerId = payload.sub;
            client.join(playerRoom(payload.sub));
        } catch  {
            client.disconnect(true);
        }
    }
    emitToPlayer(playerId, event, payload) {
        this.server.to(playerRoom(playerId)).emit(event, payload);
    }
    constructor(jwt){
        this.jwt = jwt;
    }
};
_ts_decorate([
    (0, _websockets.WebSocketServer)(),
    _ts_metadata("design:type", typeof Server === "undefined" ? Object : Server)
], RealtimeGateway.prototype, "server", void 0);
RealtimeGateway = _ts_decorate([
    (0, _common.Injectable)(),
    (0, _websockets.WebSocketGateway)({
        cors: {
            origin: "*"
        }
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], RealtimeGateway);
function playerRoom(playerId) {
    return `player:${playerId}`;
}

//# sourceMappingURL=realtime.gateway.js.map