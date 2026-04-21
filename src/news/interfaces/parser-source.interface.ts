import { ParserSourceType } from '../dto/parser-source.dto';

export interface ParserSourceResponse {
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
