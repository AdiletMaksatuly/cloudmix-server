import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { LoginDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateJwt(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return { userId: payload.sub, username: payload.username };
    } catch (err) {
      return null;
    }
  }

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (user && (await this.userService.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };

    const accessSecret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '2h');

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.findById(payload.sub);

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Refresh token expired');
      }
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
