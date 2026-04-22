import { Injectable } from '@nestjs/common';
import {
  ParserSourceResponse,
  ParserSourceSummaryResponse,
  ParserParsingErrorResponse,
} from './responses/parser-service.response';
import { PaginatedResponse } from '../common/responses/paginated.response';

@Injectable()
export class ParserMapper {
  toSourceResponse(data: any): ParserSourceResponse {
    const response = new ParserSourceResponse();
    Object.assign(response, data);
    return response;
  }

  toSourceSummaryResponse(data: any): ParserSourceSummaryResponse {
    const response = new ParserSourceSummaryResponse();
    Object.assign(response, data);
    return response;
  }

  toParsingErrorResponse(data: any): ParserParsingErrorResponse {
    const response = new ParserParsingErrorResponse();
    Object.assign(response, data);
    return response;
  }

  toPaginatedSourcesResponse(
    paginated: any,
  ): PaginatedResponse<ParserSourceSummaryResponse> {
    const response = new PaginatedResponse<ParserSourceSummaryResponse>();
    response.data = paginated.data.map((item: any) =>
      this.toSourceSummaryResponse(item),
    );
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }

  toPaginatedParsingErrorsResponse(
    paginated: any,
  ): PaginatedResponse<ParserParsingErrorResponse> {
    const response = new PaginatedResponse<ParserParsingErrorResponse>();
    response.data = paginated.data.map((item: any) =>
      this.toParsingErrorResponse(item),
    );
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }
}
