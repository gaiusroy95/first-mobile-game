import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Applied to every controller except AuthController - see auth/jwt.strategy.ts for what populates `request.user`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
