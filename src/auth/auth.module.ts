import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "../user/user.module";
import { ConfigService } from "@nestjs/config";
import { JwtWsStrategy } from "./jwt-ws.strategy";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    forwardRef(() => ChatModule),  // Use forwardRef here as well
  ],
  providers: [AuthService, JwtStrategy, JwtWsStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
