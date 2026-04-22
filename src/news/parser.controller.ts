import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParserClient } from './clients/parser.client';
import { ParserMapper } from './parser.mapper';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  CreateSourceDto,
  UpdateSourceBasicDto,
  UpdateSourceStatusDto,
  UpdateSourceConfigDto,
} from './dto/parser-source.dto';
import {
  ListSourcesQueryDto,
  ListParsingErrorsQueryDto,
} from './dto/parser-query.dto';
import { ACCESS_TOKEN_COOKIE } from '../auth/constants';
import { PaginatedResponse } from '../common/responses/paginated.response';
import {
  ParserSourceResponse,
  ParserSourceSummaryResponse,
  ParserParsingErrorResponse,
} from './responses/parser-service.response';

@Controller('parser')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ParserController {
  constructor(
    private readonly parserClient: ParserClient,
    private readonly parserMapper: ParserMapper,
  ) {}

  private getToken(req: any): string | undefined {
    return (
      req.headers.authorization?.split(' ')[1] ||
      req.cookies?.[ACCESS_TOKEN_COOKIE]
    );
  }

  @Get('sources')
  async listSources(
    @Query() query: ListSourcesQueryDto,
    @Request() req,
  ): Promise<PaginatedResponse<ParserSourceSummaryResponse>> {
    const result = await this.parserClient.listSources(
      query,
      this.getToken(req),
    );
    return this.parserMapper.toPaginatedSourcesResponse(result);
  }

  @Get('sources/errors')
  async listParsingErrors(
    @Query() query: ListParsingErrorsQueryDto,
    @Request() req,
  ): Promise<PaginatedResponse<ParserParsingErrorResponse>> {
    const result = await this.parserClient.listParsingErrors(
      query,
      this.getToken(req),
    );
    return this.parserMapper.toPaginatedParsingErrorsResponse(result);
  }

  @Post('sources')
  async createSource(
    @Body() data: CreateSourceDto,
    @Request() req,
  ): Promise<ParserSourceResponse> {
    const result = await this.parserClient.createSource(
      data,
      this.getToken(req),
    );
    return this.parserMapper.toSourceResponse(result);
  }

  @Get('sources/:id')
  async getSourceById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ParserSourceResponse> {
    const result = await this.parserClient.getSourceById(
      id,
      this.getToken(req),
    );
    return this.parserMapper.toSourceResponse(result);
  }

  @Patch('sources/:id')
  async updateSourceBasic(
    @Param('id') id: string,
    @Body() data: UpdateSourceBasicDto,
    @Request() req,
  ): Promise<ParserSourceResponse> {
    const result = await this.parserClient.updateSourceBasic(
      id,
      data,
      this.getToken(req),
    );
    return this.parserMapper.toSourceResponse(result);
  }

  @Put('sources/:id/status')
  async updateSourceStatus(
    @Param('id') id: string,
    @Body() data: UpdateSourceStatusDto,
    @Request() req,
  ): Promise<ParserSourceResponse> {
    const result = await this.parserClient.updateSourceStatus(
      id,
      data,
      this.getToken(req),
    );
    return this.parserMapper.toSourceResponse(result);
  }

  @Put('sources/:id/config')
  async updateSourceConfig(
    @Param('id') id: string,
    @Body() data: UpdateSourceConfigDto,
    @Request() req,
  ): Promise<ParserSourceResponse> {
    const result = await this.parserClient.updateSourceConfig(
      id,
      data,
      this.getToken(req),
    );
    return this.parserMapper.toSourceResponse(result);
  }

  @Post('sources/:id/parse')
  async triggerSourceParse(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    return this.parserClient.triggerSourceParse(id, this.getToken(req));
  }

  @Delete('sources/:id')
  async deleteSource(@Param('id') id: string, @Request() req): Promise<void> {
    return this.parserClient.deleteSource(id, this.getToken(req));
  }
}
