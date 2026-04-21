import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchWrapper } from '../../common/utils/fetch-wrapper.util';
import { ParserSourceResponse } from '../interfaces/parser-source.interface';

@Injectable()
export class ParserClient {
  private readonly parserServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.parserServiceUrl =
      this.configService.get<string>('parserService.url')!;
  }

  async getSourceById(
    id: string,
    token?: string,
  ): Promise<ParserSourceResponse> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetchWrapper<ParserSourceResponse>(
      `${this.parserServiceUrl}/sources/${id}`,
      {
        method: 'GET',
        headers,
      },
    );
  }
}
