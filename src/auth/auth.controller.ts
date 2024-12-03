import { Controller, Post, Body, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
