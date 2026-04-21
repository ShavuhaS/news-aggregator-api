import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ParserClient } from './parser.client';
import { JwksService } from '../../auth/jwks.service';
import { Role } from '@prisma/client';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
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
export class AdminParserClient {
  constructor(
    private readonly parserClient: ParserClient,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwksService: JwksService,
  ) {}

  private async generateAdminToken(): Promise<string> {
    const payload: JwtPayload = {
      sub: 'system-admin',
      username: 'system-admin',
      email: 'admin@system.local',
      role: Role.ADMIN,
    };

    const privateKey = this.configService.get<string>('jwt.privateKey')!;
    const kid = this.jwksService.getKid();

    return this.jwtService.signAsync(payload, {
      privateKey,
      algorithm: 'RS256',
      keyid: kid,
      expiresIn: '5m',
    });
  }

  async listSources(
    query: ListSourcesQueryDto,
  ): Promise<PaginatedResponse<ParserSourceSummaryResponse>> {
    const token = await this.generateAdminToken();
    return this.parserClient.listSources(query, token);
  }

  async listParsingErrors(
    query: ListParsingErrorsQueryDto,
  ): Promise<PaginatedResponse<ParserParsingErrorResponse>> {
    const token = await this.generateAdminToken();
    return this.parserClient.listParsingErrors(query, token);
  }

  async createSource(data: CreateSourceDto): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.createSource(data, token);
  }

  async getSourceById(id: string): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.getSourceById(id, token);
  }

  async updateSourceBasic(
    id: string,
    data: UpdateSourceBasicDto,
  ): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.updateSourceBasic(id, data, token);
  }

  async updateSourceStatus(
    id: string,
    data: UpdateSourceStatusDto,
  ): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.updateSourceStatus(id, data, token);
  }

  async updateSourceConfig(
    id: string,
    data: UpdateSourceConfigDto,
  ): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.updateSourceConfig(id, data, token);
  }

  async triggerSourceParse(id: string): Promise<void> {
    const token = await this.generateAdminToken();
    return this.parserClient.triggerSourceParse(id, token);
  }

  async deleteSource(id: string): Promise<void> {
    const token = await this.generateAdminToken();
    return this.parserClient.deleteSource(id, token);
  }
}
