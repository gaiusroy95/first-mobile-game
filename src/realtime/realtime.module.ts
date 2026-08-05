import { Module } from "@nestjs/common";
import { JwtConfigModule } from "../common/jwt-config.module";
import { RealtimeGateway } from "./realtime.gateway";

@Module({
  imports: [JwtConfigModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
