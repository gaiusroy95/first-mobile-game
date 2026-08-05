"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _core = require("@nestjs/core");
const _config = require("@nestjs/config");
const _common = require("@nestjs/common");
const _appmodule = require("./app.module");
const _redisioadapter = require("./common/redis-io.adapter");
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    const config = app.get(_config.ConfigService);
    const redisAdapter = new _redisioadapter.RedisIoAdapter(app);
    await redisAdapter.connectToRedis(config.getOrThrow("REDIS_URL"));
    app.useWebSocketAdapter(redisAdapter);
    app.enableCors();
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        transform: true
    }));
    // Without this, entity fields marked @Exclude() (passwordHash) are
    // returned as-is - found by actually calling the API and seeing the
    // hash come back, not by inspection.
    app.useGlobalInterceptors(new _common.ClassSerializerInterceptor(app.get(_core.Reflector)));
    const port = config.get("PORT") ?? 3000;
    await app.listen(port);
    console.log(`battle-formation backend listening on :${port}`);
}
bootstrap();

//# sourceMappingURL=main.js.map