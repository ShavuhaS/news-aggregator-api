import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Body,
  Post,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponse } from './responses/user.response';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserMapper } from './user.mapper';

@Controller('user/profile')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get()
  async getProfile(@Request() req): Promise<UserResponse> {
    const user = await this.userService.findById(req.user.id);
    return this.userMapper.toResponse(user!);
  }

  @Patch()
  async updateProfile(
    @Request() req,
    @Body() data: UpdateProfileDto,
  ): Promise<UserResponse> {
    const user = await this.userService.update(req.user.id, data);
    return this.userMapper.toResponse(user);
  }

  @Post('categories/:id')
  @HttpCode(HttpStatus.OK)
  async addCategory(@Request() req, @Param('id') categoryId: string) {
    return this.userService.addCategory(req.user.id, categoryId);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(@Request() req, @Param('id') categoryId: string) {
    return this.userService.removeCategory(req.user.id, categoryId);
  }

  @Post('locations/:id')
  @HttpCode(HttpStatus.OK)
  async addLocation(@Request() req, @Param('id') locationId: string) {
    return this.userService.addLocation(req.user.id, locationId);
  }

  @Delete('locations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLocation(@Request() req, @Param('id') locationId: string) {
    return this.userService.removeLocation(req.user.id, locationId);
  }
}
