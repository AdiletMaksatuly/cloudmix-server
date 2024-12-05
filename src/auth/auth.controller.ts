import { BadRequestException, Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChatGateway } from "../chat/chat.gateway";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existingUser = await this.userService.findByUsernameOrEmail(username) ||
      await this.userService.findByUsernameOrEmail(email);
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    return this.userService.register(username, email, password);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);

    await this.userService.changeUserStatus(user.id, true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Req() request: Request) {
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new BadRequestException('No token provided');
    }

    try {
      const decoded = await this.authService.validateJwt(token);
      const userId = decoded.userId;

      await this.userService.changeUserStatus(userId, false);

      this.authService.blacklistToken(token);

      const socket = this.chatGateway.userSockets.get(userId);

      if (socket) {
        socket.disconnect(true);
      }

      return { message: 'User logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
