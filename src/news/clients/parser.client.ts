import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchWrapper } from '../../common/utils/fetch-wrapper.util';
import {
  ParserSourceResponse,
  ParserSourceSummaryResponse,
  ParserParsingErrorResponse,
} from '../responses/parser-service.response';
import { PaginatedResponse } from '../../common/responses/paginated.response';
import {
  CreateSourceDto,
  UpdateSourceBasicDto,
  UpdateSourceStatusDto,
  UpdateSourceConfigDto,
} from '../dto/parser-source.dto';
import {
  ListSourcesQueryDto,
  ListParsingErrorsQueryDto,
} from '../dto/parser-query.dto';

@Injectable()
export class ParserClient {
  private readonly parserServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.parserServiceUrl =
      this.configService.get<string>('parserService.url')!;
  }

  private async request<T>(
    path: string,
    method: string,
    data?: any,
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetchWrapper<T>(`${this.parserServiceUrl}${path}`, {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  async listSources(
    query: ListSourcesQueryDto,
    token?: string,
  ): Promise<PaginatedResponse<ParserSourceSummaryResponse>> {
    const params = new URLSearchParams();

    params.append('page', (query.page || 1).toString());
    params.append('pageSize', (query.pageSize || 20).toString());

    if (query.active !== undefined) {
      params.append('active', query.active.toString());
    }
    if (query.search) {
      params.append('search', query.search);
    }
    if (query.sortBy) {
      params.append('sortBy', query.sortBy);
    }
    if (query.sortDir) {
      params.append('sortDir', query.sortDir);
    }

    if (query.types) {
      query.types.forEach((type) => {
        params.append('type', type);
      });
    }

    const path = `/sources?${params.toString()}`;

    return this.request<PaginatedResponse<ParserSourceSummaryResponse>>(
      path,
      'GET',
      null,
      token,
    );
  }

  async listParsingErrors(
    query: ListParsingErrorsQueryDto,
    token?: string,
  ): Promise<PaginatedResponse<ParserParsingErrorResponse>> {
    const params = new URLSearchParams();
    params.append('page', (query.page || 1).toString());
    params.append('pageSize', (query.pageSize || 20).toString());

    if (query.sourceId) params.append('sourceId', query.sourceId);
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    return this.request<PaginatedResponse<ParserParsingErrorResponse>>(
      `/sources/errors?${params.toString()}`,
      'GET',
      null,
      token,
    );
  }

  async createSource(
    data: CreateSourceDto,
    token?: string,
  ): Promise<ParserSourceResponse> {
    return this.request<ParserSourceResponse>('/sources', 'POST', data, token);
  }

  async getSourceById(
    id: string,
    token?: string,
  ): Promise<ParserSourceResponse> {
    return this.request<ParserSourceResponse>(
      `/sources/${id}`,
      'GET',
      null,
      token,
    );
  }

  async updateSourceBasic(
    id: string,
    data: UpdateSourceBasicDto,
    token?: string,
  ): Promise<ParserSourceResponse> {
    return this.request<ParserSourceResponse>(
      `/sources/${id}`,
      'PATCH',
      data,
      token,
    );
  }

  async updateSourceStatus(
    id: string,
    data: UpdateSourceStatusDto,
    token?: string,
  ): Promise<ParserSourceResponse> {
    return this.request<ParserSourceResponse>(
      `/sources/${id}/status`,
      'PUT',
      data,
      token,
    );
  }

  async updateSourceConfig(
    id: string,
    data: UpdateSourceConfigDto,
    token?: string,
  ): Promise<ParserSourceResponse> {
    return this.request<ParserSourceResponse>(
      `/sources/${id}/config`,
      'PUT',
      data,
      token,
    );
  }

  async triggerSourceParse(id: string, token?: string): Promise<void> {
    return this.request<void>(`/sources/${id}/parse`, 'POST', null, token);
  }

  async deleteSource(id: string, token?: string): Promise<void> {
    return this.request<void>(`/sources/${id}`, 'DELETE', null, token);
  }
}
