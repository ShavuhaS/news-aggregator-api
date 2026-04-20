import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponse } from './responses/user.response';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<UserResponse> {
    const user = await this.userService.findById(req.user.id);
    const { password, ...result } = user!;
    return result;
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() data: UpdateProfileDto): Promise<UserResponse> {
    const user = await this.userService.update(req.user.id, data);
    const { password, ...result } = user;
    return result;
  }
}
