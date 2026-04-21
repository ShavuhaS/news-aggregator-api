import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { ParserSourceResponse } from './interfaces/parser-source.interface';
import { AdminParserClient } from './clients/admin-parser.client';
import { ListNewsQueryDto, NewsSortField } from './dto/list-news-query.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { UpdateNewsLocationDto } from './dto/update-news-location.dto';
import { PaginatedResponse } from '../common/responses/paginated.response';
import { NewsResponse } from './responses/news.response';
import { NewsWithComplaintsResponse } from './responses/news-with-complaints.response';
import { ComplaintResponse } from './responses/complaint.response';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly defaultImageUrl = '/static/default-news.png';

  constructor(
    private readonly prisma: PrismaService,
    private readonly adminParserClient: AdminParserClient,
  ) {}

  async handleAnalyzedNews(data: AnalyzedNews) {
    try {
      const category = await this.prisma.newsCategory.upsert({
        where: { name: data.category },
        update: {},
        create: { name: data.category },
      });

      let imageUrl = data.image_url;
      if (!imageUrl) {
        imageUrl = await this.getSourceLogo(data.source_id);
      }
      if (!imageUrl) {
        imageUrl = this.defaultImageUrl;
      }

      const existingNews = await this.prisma.news.findUnique({
        where: { link: data.link },
      });

      if (existingNews) {
        this.logger.log(
          `News with link ${data.link} already exists. Skipping.`,
        );
        return existingNews;
      }

      let publishedAt = new Date(data.published_at);
      if (publishedAt.getUTCFullYear() <= 0) {
        this.logger.warn(
          `Invalid published_at year (0) for source ${data.source_id}. Setting to current year.`,
        );
        publishedAt.setUTCFullYear(new Date().getUTCFullYear());
      }

      return await this.prisma.$transaction(async (tx) => {
        const locationIds: string[] = [];

        for (const loc of data.locations) {
          const existingLocation = await tx.location.findUnique({
            where: { address: loc.formatted_address },
          });

          let location;
          if (existingLocation) {
            location = await tx.location.update({
              where: { id: existingLocation.id },
              data: {
                lemma: loc.lemma,
                originalText: loc.original_text,
                lat: loc.lat,
                lon: loc.lon,
              },
            });
          } else {
            location = await tx.location.create({
              data: {
                address: loc.formatted_address,
                lemma: loc.lemma,
                originalText: loc.original_text,
                lat: loc.lat,
                lon: loc.lon,
              },
            });
          }

          await tx.$executeRaw`
            UPDATE locations 
            SET coords = ST_SetSRID(ST_MakePoint(${loc.lon}, ${loc.lat}), 4326) 
            WHERE id = ${location.id}
          `;

          locationIds.push(location.id);
        }

        const news = await tx.news.create({
          data: {
            title: data.title,
            description: data.description,
            link: data.link,
            imageUrl,
            publishedAt,
            sentimentScore: data.sentiment_score,
            sourceId: data.source_id,
            categoryId: category.id,
            locations: {
              create: [...new Set(locationIds)].map((id) => ({
                locationId: id,
              })),
            },
          },
        });

        return news;
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle analyzed news: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getSourceLogo(sourceId: string): Promise<string | null> {
    try {
      const source = await this.adminParserClient.getSourceById(sourceId);
      return source.logoUrl;
    } catch (error) {
      this.logger.warn(
        `Could not fetch source logo for ${sourceId}: ${error.message}`,
      );
      return null;
    }
  }

  async listNews(
    query: ListNewsQueryDto,
  ): Promise<PaginatedResponse<NewsResponse>> {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      locationId,
      minSentiment,
      maxSentiment,
      from,
      to,
      search,
      sortBy = NewsSortField.PUBLISHED_AT,
      sortOrder = 'desc',
    } = query;

    const where: Prisma.NewsWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (locationId) {
      where.locations = {
        some: {
          locationId: locationId,
        },
      };
    }

    if (minSentiment !== undefined || maxSentiment !== undefined) {
      where.sentimentScore = {
        gte: minSentiment,
        lte: maxSentiment,
      };
    }

    if (from || to) {
      where.publishedAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      data: data as NewsResponse[],
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async getNewsById(id: string): Promise<NewsResponse | null> {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        locations: {
          include: { location: true },
        },
      },
    });

    if (!news) return null;

    return {
      ...news,
      locations: news.locations.map((loc) => loc.location),
    } as NewsResponse;
  }

  async getNewsComplaints(
    newsId: string,
    query: ListComplaintsQueryDto,
  ): Promise<PaginatedResponse<ComplaintResponse>> {
    const { page = 1, pageSize = 20 } = query;

    const [data, totalCount] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { newsId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count({ where: { newsId } }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async listNewsWithComplaints(
    query: ListComplaintsQueryDto,
  ): Promise<PaginatedResponse<NewsWithComplaintsResponse>> {
    const { page = 1, pageSize = 20 } = query;

    const [data, totalCount] = await Promise.all([
      this.prisma.news.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          complaints: { _count: 'desc' },
        },
        include: {
          category: true,
          _count: {
            select: { complaints: true },
          },
        },
      }),
      this.prisma.news.count(),
    ]);

    const formattedData: NewsWithComplaintsResponse[] = data.map((item) => ({
      ...item,
      complaintsCount: item._count.complaints,
    })) as NewsWithComplaintsResponse[];

    return {
      data: formattedData,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async updateNewsCategory(
    newsId: string,
    data: UpdateNewsCategoryDto,
  ): Promise<NewsResponse> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    const category = await this.prisma.newsCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new BadRequestException('Category does not exist');

    const updatedNews = await this.prisma.news.update({
      where: { id: newsId },
      data: { categoryId: data.categoryId },
      include: {
        category: true,
        locations: { include: { location: true } },
      },
    });

    return {
      ...updatedNews,
      locations: updatedNews.locations.map((loc) => loc.location),
    } as NewsResponse;
  }

  async addNewsLocation(newsId: string, locationId: string): Promise<void> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) throw new BadRequestException('Location does not exist');

    await this.prisma.newsLocation.upsert({
      where: { newsId_locationId: { newsId, locationId } },
      create: { newsId, locationId },
      update: {},
    });
  }

  async removeNewsLocation(newsId: string, locationId: string): Promise<void> {
    await this.prisma.newsLocation
      .delete({
        where: { newsId_locationId: { newsId, locationId } },
      })
      .catch(() => {
        throw new NotFoundException('Location not associated with this news');
      });
  }
}
