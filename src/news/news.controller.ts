import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NewsService } from './news.service';
import type { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @EventPattern('news-analyzed')
  async handleAnalyzedNews(@Payload() data: AnalyzedNews) {
    return this.newsService.handleAnalyzedNews(data);
  }

  @Get()
  async listNews(@Query() query: ListNewsQueryDto) {
    return this.newsService.listNews(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('complaints')
  async listNewsWithComplaints(@Query() query: ListComplaintsQueryDto) {
    return this.newsService.listNewsWithComplaints(query);
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const news = await this.newsService.getNewsById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    return news;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id/complaints')
  async getNewsComplaints(
    @Param('id') id: string,
    @Query() query: ListComplaintsQueryDto,
  ) {
    return this.newsService.getNewsComplaints(id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':newsId/category')
  async updateNewsCategory(
    @Param('newsId') newsId: string,
    @Body() data: UpdateNewsCategoryDto,
  ) {
    return this.newsService.updateNewsCategory(newsId, data);
  }
}
