import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Put,
  Body,
  UseGuards,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NewsService } from './news.service';
import { NewsMapper } from './news.mapper';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { UpdateNewsLocationDto } from './dto/update-news-location.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ListLocationsQueryDto } from './dto/list-locations-query.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { ListNearbyNewsQueryDto } from './dto/list-nearby-news-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginatedResponse } from '../common/responses/paginated.response';
import {
  NewsResponse,
  NewsCategoryResponse,
  LocationResponse,
} from './responses/news.response';
import { NewsWithComplaintsResponse } from './responses/news-with-complaints.response';
import { ComplaintResponse } from './responses/complaint.response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsMapper: NewsMapper,
  ) {}

  @EventPattern('news-analyzed')
  @ApiOperation({ summary: 'Internal: Handle analyzed news from Kafka' })
  async handleAnalyzedNews(@Payload() data: AnalyzedNews) {
    return this.newsService.handleAnalyzedNews(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all news with filters' })
  @ApiResponse({ status: 200, type: PaginatedResponse<NewsResponse> })
  async listNews(
    @Query() query: ListNewsQueryDto,
  ): Promise<PaginatedResponse<NewsResponse>> {
    const result = await this.newsService.listNews(query);
    return this.newsMapper.toPaginatedNewsResponse(result);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List news categories' })
  @ApiResponse({ status: 200, type: PaginatedResponse<NewsCategoryResponse> })
  async listCategories(
    @Query() query: ListCategoriesQueryDto,
  ): Promise<PaginatedResponse<NewsCategoryResponse>> {
    const result = await this.newsService.listCategories(query);
    return this.newsMapper.toPaginatedCategoryResponse(result);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'List news near coordinates' })
  @ApiResponse({ status: 200, type: PaginatedResponse<NewsResponse> })
  async listNearbyNews(
    @Query() query: ListNearbyNewsQueryDto,
  ): Promise<PaginatedResponse<NewsResponse>> {
    const result = await this.newsService.listNearbyNews(query);
    return this.newsMapper.toPaginatedNewsResponse(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('complaints')
  @ApiOperation({ summary: 'List news items with pending complaints (Admin)' })
  @ApiResponse({
    status: 200,
    type: PaginatedResponse<NewsWithComplaintsResponse>,
  })
  async listNewsWithComplaints(
    @Query() query: ListComplaintsQueryDto,
  ): Promise<PaginatedResponse<NewsWithComplaintsResponse>> {
    const result = await this.newsService.listNewsWithComplaints(query);
    return this.newsMapper.toPaginatedNewsWithComplaintsResponse(result);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List news locations' })
  @ApiResponse({ status: 200, type: PaginatedResponse<LocationResponse> })
  async listLocations(
    @Query() query: ListLocationsQueryDto,
  ): Promise<PaginatedResponse<LocationResponse>> {
    const result = await this.newsService.listLocations(query);
    return this.newsMapper.toPaginatedLocationResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @ApiResponse({ status: 200, type: NewsResponse })
  async getNewsById(@Param('id') id: string): Promise<NewsResponse> {
    const news = await this.newsService.getNewsById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    return this.newsMapper.toNewsResponse(news);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id/complaints')
  @ApiOperation({ summary: 'Get pending complaints for a news item (Admin)' })
  @ApiResponse({ status: 200, type: PaginatedResponse<ComplaintResponse> })
  async getNewsComplaints(
    @Param('id') id: string,
    @Query() query: ListComplaintsQueryDto,
  ): Promise<PaginatedResponse<ComplaintResponse>> {
    const result = await this.newsService.getNewsComplaints(id, query);
    return this.newsMapper.toPaginatedComplaintResponse(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/complaints')
  @ApiOperation({ summary: 'Submit a complaint for a news item' })
  @ApiResponse({ status: 201, type: ComplaintResponse })
  async createNewsComplaint(
    @Param('id') id: string,
    @Body() data: CreateComplaintDto,
    @Request() req,
  ): Promise<ComplaintResponse> {
    const complaint = await this.newsService.createNewsComplaint(
      id,
      req.user.id,
      data,
    );
    return this.newsMapper.toComplaintResponse(complaint);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/complaints/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve all complaints and delete news (Admin)' })
  @ApiResponse({ status: 200 })
  async resolveNewsComplaints(@Param('id') id: string): Promise<void> {
    return this.newsService.resolveNewsComplaints(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/complaints/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject all pending complaints (Admin)' })
  @ApiResponse({ status: 200 })
  async rejectNewsComplaints(@Param('id') id: string): Promise<void> {
    return this.newsService.rejectNewsComplaints(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':newsId/category')
  @ApiOperation({ summary: 'Update news category (Admin)' })
  @ApiResponse({ status: 200, type: NewsResponse })
  async updateNewsCategory(
    @Param('newsId') newsId: string,
    @Body() data: UpdateNewsCategoryDto,
  ): Promise<NewsResponse> {
    const news = await this.newsService.updateNewsCategory(newsId, data);
    return this.newsMapper.toNewsResponse(news);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/locations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a location to news (Admin)' })
  @ApiResponse({ status: 200 })
  async addNewsLocation(
    @Param('id') id: string,
    @Body() data: UpdateNewsLocationDto,
  ): Promise<void> {
    return this.newsService.addNewsLocation(id, data.locationId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/locations/:locationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a location from news (Admin)' })
  @ApiResponse({ status: 204 })
  async removeNewsLocation(
    @Param('id') id: string,
    @Param('locationId') locationId: string,
  ): Promise<void> {
    return this.newsService.removeNewsLocation(id, locationId);
  }
}
