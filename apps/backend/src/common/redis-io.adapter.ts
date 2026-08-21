import { Logger, type INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import type { ServerOptions, Server } from "socket.io";

const logger = new Logger("RedisIoAdapter");

/**
 * Without this, `server.emit()`/`server.to(room).emit()` only reaches
 * sockets connected to *this* process. Two players matched together can
 * easily end up on different backend instances behind a load balancer, so
 * the gateway (see realtime/realtime.gateway.ts) would silently fail to
 * deliver to whichever one isn't local. The Redis adapter publishes every
 * emit through Redis pub/sub so all instances relay it to their own
 * matching local sockets - this one line is what makes Socket.IO
 * horizontally scalable at all.
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(redisUrl: string): Promise<void> {
    const pubClient = new IORedis(redisUrl);
    const subClient = pubClient.duplicate();
    // Same reasoning as RedisService: without a listener here, a
    // connection failure surfaces as unbounded "missing 'error' handler"
    // console spam instead of one clear, attributable log line.
    pubClient.on("error", (error) => logger.error(`Redis pub client error: ${error.message}`));
    subClient.on("error", (error) => logger.error(`Redis sub client error: ${error.message}`));
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
