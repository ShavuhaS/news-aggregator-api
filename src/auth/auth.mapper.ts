import { Injectable } from '@nestjs/common';
import { TokensResponse } from './responses/tokens.response';

@Injectable()
export class AuthMapper {
  toTokensResponse(data: {
    accessToken: string;
    refreshToken: string;
  }): TokensResponse {
    const response = new TokensResponse();
    response.accessToken = data.accessToken;
    response.refreshToken = data.refreshToken;
    return response;
  }
}
