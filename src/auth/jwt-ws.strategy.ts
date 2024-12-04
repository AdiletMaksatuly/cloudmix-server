import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport";
import { ConfigService } from "@nestjs/config";
import { User } from "../user/user.entity";
import { JwtPayload } from "./jwt-payload.interface";
import { UserService } from "../user/user.service";

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: (req) => {
        const token: string | undefined = req.handshake?.headers?.authorization?.split(' ')[1];
        return token || null;
      },
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
