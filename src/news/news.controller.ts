import { Controller, Get, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NewsService } from './news.service';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { ListNewsQueryDto } from './dto/list-news-query.dto';

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
}
