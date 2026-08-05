"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisIoAdapter", {
    enumerable: true,
    get: function() {
        return RedisIoAdapter;
    }
});
const _platformsocketio = require("@nestjs/platform-socket.io");
const _redisadapter = require("@socket.io/redis-adapter");
const _ioredis = /*#__PURE__*/ _interop_require_default(require("ioredis"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let RedisIoAdapter = class RedisIoAdapter extends _platformsocketio.IoAdapter {
    async connectToRedis(redisUrl) {
        const pubClient = new _ioredis.default(redisUrl);
        const subClient = pubClient.duplicate();
        this.adapterConstructor = (0, _redisadapter.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
    constructor(app){
        super(app);
    }
};

//# sourceMappingURL=redis-io.adapter.js.map