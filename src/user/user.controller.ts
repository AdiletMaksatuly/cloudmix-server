import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserDecorator } from "../auth/user.decorator";
import { User } from "./user.entity";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Query('name') name?: string) {
    return this.userService.getAllUsers(name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@UserDecorator() user: User): Promise<User> {
    return user;
  }
}
