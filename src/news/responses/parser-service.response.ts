import { ParserSourceType } from '../dto/parser-source.dto';

export class ParserSourceResponse {
  id: string;
  name: string;
  url: string;
  type: ParserSourceType;
  active: boolean;
  schedule: string | null;
  configuration: Record<string, any>;
  lastParsedAt: string | null;
  nextRunAt: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ParserSourceSummaryResponse {
  id: string;
  name: string;
  url: string;
  type: ParserSourceType;
  active: boolean;
  schedule: string | null;
  lastParsedAt: string | null;
  nextRunAt: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ParserParsingErrorResponse {
  id: string;
  sourceId: string;
  errorMessage: string | null;
  createdAt: string | null;
}
