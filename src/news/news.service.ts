import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { AdminParserClient } from './clients/admin-parser.client';
import { ListNewsQueryDto, NewsSortField } from './dto/list-news-query.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { PaginatedResponse } from '../common/responses/paginated.response';
import {
  NewsWithRelations,
  NewsWithComplaintsCount,
} from './interfaces/news-with-relations.interface';
import {
  Prisma,
  ComplaintStatus,
  NewsCategory,
  Location,
  Complaint,
} from '@prisma/client';
import { ListLocationsQueryDto } from './dto/list-locations-query.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { ListNearbyNewsQueryDto } from './dto/list-nearby-news-query.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

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
  ): Promise<PaginatedResponse<NewsWithRelations>> {
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
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        where.AND = words.map((word) => ({
          OR: [
            { title: { contains: word, mode: 'insensitive' } },
            { description: { contains: word, mode: 'insensitive' } },
          ],
        }));
      }
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          locations: { include: { location: true } },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async getNewsById(id: string): Promise<NewsWithRelations | null> {
    return this.prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        locations: {
          include: { location: true },
        },
      },
    });
  }

  async getCategoryById(id: string): Promise<NewsCategory | null> {
    return this.prisma.newsCategory.findUnique({ where: { id } });
  }

  async getLocationById(id: string): Promise<Location | null> {
    return this.prisma.location.findUnique({ where: { id } });
  }

  async getNewsComplaints(
    newsId: string,
    query: ListComplaintsQueryDto,
  ): Promise<PaginatedResponse<Complaint>> {
    const { page = 1, pageSize = 20 } = query;

    const where = { newsId, status: ComplaintStatus.PENDING };

    const [data, totalCount] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count({ where }),
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
  ): Promise<PaginatedResponse<NewsWithComplaintsCount>> {
    const { page = 1, pageSize = 20 } = query;

    const [data, totalCount] = await Promise.all([
      this.prisma.news.findMany({
        where: {
          complaints: {
            some: { status: ComplaintStatus.PENDING },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          complaints: { _count: 'desc' },
        },
        include: {
          category: true,
          _count: {
            select: {
              complaints: {
                where: { status: ComplaintStatus.PENDING },
              },
            },
          },
        },
      }),
      this.prisma.news.count({
        where: {
          complaints: {
            some: { status: ComplaintStatus.PENDING },
          },
        },
      }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async updateNewsCategory(
    newsId: string,
    data: UpdateNewsCategoryDto,
  ): Promise<NewsWithRelations> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    const category = await this.prisma.newsCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new BadRequestException('Category does not exist');

    return this.prisma.news.update({
      where: { id: newsId },
      data: { categoryId: data.categoryId },
      include: {
        category: true,
        locations: { include: { location: true } },
      },
    });
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

  async createNewsComplaint(
    newsId: string,
    userId: string,
    data: CreateComplaintDto,
  ): Promise<Complaint> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    return this.prisma.complaint.upsert({
      where: { newsId_userId: { newsId, userId } },
      update: {
        reason: data.reason,
      },
      create: {
        newsId,
        userId,
        reason: data.reason,
      },
    });
  }

  async resolveNewsComplaints(newsId: string): Promise<void> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    await this.prisma.$transaction([
      this.prisma.complaint.updateMany({
        where: { newsId, status: ComplaintStatus.PENDING },
        data: { status: ComplaintStatus.RESOLVED },
      }),
      this.prisma.news.delete({ where: { id: newsId } }),
    ]);
  }

  async rejectNewsComplaints(newsId: string): Promise<void> {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    await this.prisma.complaint.updateMany({
      where: { newsId, status: ComplaintStatus.PENDING },
      data: { status: ComplaintStatus.REJECTED },
    });
  }

  async listLocations(
    query: ListLocationsQueryDto,
  ): Promise<PaginatedResponse<Location>> {
    const { page = 1, pageSize = 20, search } = query;

    const where: Prisma.LocationWhereInput = {};
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        where.AND = words.map((word) => ({
          address: { contains: word, mode: 'insensitive' },
        }));
      }
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { address: 'asc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async listCategories(
    query: ListCategoriesQueryDto,
  ): Promise<PaginatedResponse<NewsCategory>> {
    const { page = 1, pageSize = 20, search } = query;

    const where: Prisma.NewsCategoryWhereInput = {};
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        where.AND = words.map((word) => ({
          name: { contains: word, mode: 'insensitive' },
        }));
      }
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.newsCategory.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.newsCategory.count({ where }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async listNearbyNews(
    query: ListNearbyNewsQueryDto,
  ): Promise<PaginatedResponse<NewsWithRelations>> {
    const { lat, lon, dist, page = 1, pageSize = 20, search } = query;
    const offset = (page - 1) * pageSize;

    let searchFilter = Prisma.empty;
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const conditions = words.map(
          (word) =>
            Prisma.sql`(n.title ILIKE ${'%' + word + '%'} OR n.description ILIKE ${'%' + word + '%'})`,
        );
        searchFilter = Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}`;
      }
    }

    const data = await this.prisma.$queryRaw<any[]>`
      SELECT n.*, 
             json_build_object('id', c.id, 'name', c.name) as category,
             COALESCE(
               json_agg(
                 json_build_object(
                   'location', json_build_object(
                     'id', l.id, 
                     'address', l.address, 
                     'lemma', l.lemma, 
                     'originalText', l.original_text, 
                     'lat', l.lat, 
                     'lon', l.lon
                   )
                 )
               ) FILTER (WHERE l.id IS NOT NULL), 
               '[]'
             ) as locations
      FROM news n
      JOIN news_categories c ON n.category_id = c.id
      LEFT JOIN news_locations nl ON n.id = nl.news_id
      LEFT JOIN locations l ON nl.location_id = l.id
      WHERE n.id IN (
        SELECT DISTINCT nl_inner.news_id
        FROM news_locations nl_inner
        JOIN locations l_inner ON nl_inner.location_id = l_inner.id
        WHERE ST_DWithin(
          l_inner.coords::geography, 
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, 
          ${dist} * 1000
        )
      )
      ${searchFilter}
      GROUP BY n.id, c.id
      ORDER BY n.published_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const totalCountResult = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(DISTINCT n.id) as count
      FROM news n
      JOIN news_locations nl ON n.id = nl.news_id
      JOIN locations l ON nl.location_id = l.id
      WHERE ST_DWithin(
        l.coords::geography, 
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, 
        ${dist} * 1000
      )
      ${searchFilter}
    `;

    const totalCount = Number(totalCountResult[0].count);

    const formattedData = data.map((item) => ({
      ...item,
      publishedAt: item.published_at,
      sentimentScore: item.sentiment_score,
      sourceId: item.source_id,
      categoryId: item.category_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) as NewsWithRelations[];

    return {
      data: formattedData,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNews() {
    this.logger.log('Starting old news cleanup job...');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.prisma.news.deleteMany({
      where: {
        OR: [
          { publishedAt: { lt: oneMonthAgo } },
          { createdAt: { lt: oneMonthAgo } },
        ],
      },
    });

    this.logger.log(`Cleanup finished. Deleted ${result.count} news items.`);
  }
}
