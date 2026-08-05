import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export interface AuthenticatedPlayer {
  playerId: string;
}

/** The playerId decoded from the request's JWT (see auth/jwt.strategy.ts). Only valid behind JwtAuthGuard. */
export const CurrentPlayer = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedPlayer => {
  return ctx.switchToHttp().getRequest().user as AuthenticatedPlayer;
});
