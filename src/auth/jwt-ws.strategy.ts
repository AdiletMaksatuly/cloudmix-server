import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        const token: string | undefined = req.handshake?.headers?.authorization?.split(' ')[1];
        return token || null;
      },
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
