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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponse } from './responses/user.response';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserComplaintsQueryDto } from './dto/list-user-complaints-query.dto';
import { UserMapper } from './user.mapper';
import { PaginatedResponse } from '../common/responses/paginated.response';
import { ComplaintResponse } from '../news/responses/complaint.response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('user/profile')
@ApiBearerAuth()
@Controller('user/profile')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponse })
  async getProfile(@Request() req): Promise<UserResponse> {
    const user = await this.userService.findById(req.user.id);
    return this.userMapper.toResponse(user!);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile info' })
  @ApiResponse({ status: 200, type: UserResponse })
  async updateProfile(
    @Request() req,
    @Body() data: UpdateProfileDto,
  ): Promise<UserResponse> {
    const user = await this.userService.update(req.user.id, data);
    return this.userMapper.toResponse(user);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204 })
  async changePassword(
    @Request() req,
    @Body() data: ChangePasswordDto,
  ): Promise<void> {
    return this.userService.changePassword(req.user.id, data);
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List current user complaints' })
  @ApiResponse({ status: 200, type: PaginatedResponse<ComplaintResponse> })
  async getUserComplaints(
    @Request() req,
    @Query() query: ListUserComplaintsQueryDto,
  ): Promise<PaginatedResponse<ComplaintResponse>> {
    const result = await this.userService.getUserComplaints(req.user.id, query);
    return this.userMapper.toPaginatedComplaintResponse(result);
  }

  @Post('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a preferred category' })
  @ApiResponse({ status: 200 })
  async addCategory(
    @Request() req,
    @Param('id') categoryId: string,
  ): Promise<void> {
    await this.userService.addCategory(req.user.id, categoryId);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a preferred category' })
  @ApiResponse({ status: 204 })
  async removeCategory(
    @Request() req,
    @Param('id') categoryId: string,
  ): Promise<void> {
    await this.userService.removeCategory(req.user.id, categoryId);
  }

  @Post('locations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a preferred location' })
  @ApiResponse({ status: 200 })
  async addLocation(
    @Request() req,
    @Param('id') locationId: string,
  ): Promise<void> {
    await this.userService.addLocation(req.user.id, locationId);
  }

  @Delete('locations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a preferred location' })
  @ApiResponse({ status: 204 })
  async removeLocation(
    @Request() req,
    @Param('id') locationId: string,
  ): Promise<void> {
    await this.userService.removeLocation(req.user.id, locationId);
  }
}
