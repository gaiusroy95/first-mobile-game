import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  type OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

interface JwtPayload {
  sub: string;
}

/**
 * The only thing this gateway does is authenticate the socket and put it
 * in a room keyed by playerId. Every other module (matchmaking, battles)
 * pushes events through `emitToPlayer` rather than holding gateway/socket
 * references themselves - keeps "how do we reach a connected player" in
 * exactly one place, and keeps it correct under horizontal scaling (see
 * common/redis-io.adapter.ts): `server.to(room)` is adapter-aware and
 * reaches a player's socket no matter which instance it's actually on.
 */
@Injectable()
@WebSocketGateway({ cors: { origin: "*" } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error("Missing token");

      const payload = this.jwt.verify<JwtPayload>(token);
      client.data.playerId = payload.sub;
      client.join(playerRoom(payload.sub));
    } catch {
      client.disconnect(true);
    }
  }

  emitToPlayer(playerId: string, event: string, payload: unknown): void {
    this.server.to(playerRoom(playerId)).emit(event, payload);
  }
}

function playerRoom(playerId: string): string {
  return `player:${playerId}`;
}
