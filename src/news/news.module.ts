import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { ParserController } from './parser.controller';
import { NewsMapper } from './news.mapper';
import { ParserMapper } from './parser.mapper';
import { PrismaModule } from '../prisma/prisma.module';
import { ParserClient } from './clients/parser.client';
import { AdminParserClient } from './clients/admin-parser.client';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [NewsController, ParserController],
  providers: [
    NewsService,
    ParserClient,
    AdminParserClient,
    NewsMapper,
    ParserMapper,
  ],
  exports: [NewsService, NewsMapper, ParserMapper],
})
export class NewsModule {}
