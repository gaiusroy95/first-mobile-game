import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

/**
 * Both AuthModule (issuing tokens) and RealtimeModule (verifying them on
 * socket handshake) need an identically-configured JwtService - centralized
 * here so the secret/expiry are read from config in exactly one place.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "7d" },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
