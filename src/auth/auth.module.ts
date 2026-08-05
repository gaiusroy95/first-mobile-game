import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "../players/player.entity";
import { JwtConfigModule } from "../common/jwt-config.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([Player]), PassportModule, JwtConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
