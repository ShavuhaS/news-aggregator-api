import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzedNews } from './interfaces/analyzed-news.interface';
import { AdminParserClient } from './clients/admin-parser.client';

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
}
