import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NewsService } from './news.service';
import type { AnalyzedNews } from './interfaces/analyzed-news.interface';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @EventPattern('news-analyzed')
  async handleAnalyzedNews(@Payload() data: AnalyzedNews) {
    return this.newsService.handleAnalyzedNews(data);
  }
}
