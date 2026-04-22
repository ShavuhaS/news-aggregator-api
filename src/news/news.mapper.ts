import { Injectable } from '@nestjs/common';
import { Complaint, Location, NewsCategory } from '@prisma/client';
import {
  NewsResponse,
  NewsCategoryResponse,
  LocationResponse,
} from './responses/news.response';
import {
  NewsWithRelations,
  NewsWithComplaintsCount,
} from './interfaces/news-with-relations.interface';
import { NewsWithComplaintsResponse } from './responses/news-with-complaints.response';
import { ComplaintResponse } from './responses/complaint.response';
import { PaginatedResponse } from '../common/responses/paginated.response';

@Injectable()
export class NewsMapper {
  toNewsResponse(news: NewsWithRelations): NewsResponse {
    const response = new NewsResponse();
    response.id = news.id;
    response.title = news.title;
    response.description = news.description;
    response.link = news.link;
    response.imageUrl = news.imageUrl;
    response.publishedAt = news.publishedAt;
    response.sentimentScore = news.sentimentScore;
    response.sourceId = news.sourceId;
    response.categoryId = news.categoryId;
    response.createdAt = news.createdAt;
    response.updatedAt = news.updatedAt;

    if (news.category) {
      response.category = this.toCategoryResponse(news.category);
    }

    if (news.locations) {
      response.locations = news.locations.map((loc: any) => {
        const locationData = loc.location || loc;
        return this.toLocationResponse(locationData);
      });
    }

    return response;
  }

  toNewsWithComplaintsResponse(
    news: NewsWithComplaintsCount,
  ): NewsWithComplaintsResponse {
    const response = new NewsWithComplaintsResponse();
    const newsBase = this.toNewsResponse(news as any);
    Object.assign(response, newsBase);
    response.complaintsCount = news._count.complaints;
    return response;
  }

  toCategoryResponse(category: NewsCategory): NewsCategoryResponse {
    const response = new NewsCategoryResponse();
    response.id = category.id;
    response.name = category.name;
    return response;
  }

  toLocationResponse(location: Location): LocationResponse {
    const response = new LocationResponse();
    response.id = location.id;
    response.lemma = location.lemma;
    response.address = location.address;
    response.originalText = location.originalText;
    response.lat = location.lat;
    response.lon = location.lon;
    return response;
  }

  toComplaintResponse(complaint: Complaint): ComplaintResponse {
    const response = new ComplaintResponse();
    response.id = complaint.id;
    response.newsId = complaint.newsId;
    response.userId = complaint.userId;
    response.reason = complaint.reason;
    response.status = complaint.status;
    response.createdAt = complaint.createdAt;
    response.updatedAt = complaint.updatedAt;
    return response;
  }

  toPaginatedNewsResponse(
    paginated: PaginatedResponse<NewsWithRelations>,
  ): PaginatedResponse<NewsResponse> {
    const response = new PaginatedResponse<NewsResponse>();
    response.data = paginated.data.map((item) => this.toNewsResponse(item));
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }

  toPaginatedNewsWithComplaintsResponse(
    paginated: PaginatedResponse<NewsWithComplaintsCount>,
  ): PaginatedResponse<NewsWithComplaintsResponse> {
    const response = new PaginatedResponse<NewsWithComplaintsResponse>();
    response.data = paginated.data.map((item) =>
      this.toNewsWithComplaintsResponse(item),
    );
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }

  toPaginatedComplaintResponse(
    paginated: PaginatedResponse<Complaint>,
  ): PaginatedResponse<ComplaintResponse> {
    const response = new PaginatedResponse<ComplaintResponse>();
    response.data = paginated.data.map((item) =>
      this.toComplaintResponse(item),
    );
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }

  toPaginatedCategoryResponse(
    paginated: PaginatedResponse<NewsCategory>,
  ): PaginatedResponse<NewsCategoryResponse> {
    const response = new PaginatedResponse<NewsCategoryResponse>();
    response.data = paginated.data.map((item) => this.toCategoryResponse(item));
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }

  toPaginatedLocationResponse(
    paginated: PaginatedResponse<Location>,
  ): PaginatedResponse<LocationResponse> {
    const response = new PaginatedResponse<LocationResponse>();
    response.data = paginated.data.map((item) => this.toLocationResponse(item));
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }
}
