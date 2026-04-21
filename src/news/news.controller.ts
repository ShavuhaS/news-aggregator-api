import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NewsService } from './news.service';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';

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

  @Get(':id/complaints')
  async getNewsComplaints(@Param('id') id: string, @Query() query: ListComplaintsQueryDto) {
    return this.newsService.getNewsComplaints(id, query);
  }
}
