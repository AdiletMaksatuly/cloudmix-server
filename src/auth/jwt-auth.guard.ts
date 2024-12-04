import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    } else if (err || !user) {
      throw new UnauthorizedException('INVALID_TOKEN');
    }
    return user;
  }
}
