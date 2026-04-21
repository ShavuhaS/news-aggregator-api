import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ParserClient } from './parser.client';
import { JwksService } from '../../auth/jwks.service';
import { Role } from '@prisma/client';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { ParserSourceResponse } from '../interfaces/parser-source.interface';

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

  async getSourceById(id: string): Promise<ParserSourceResponse> {
    const token = await this.generateAdminToken();
    return this.parserClient.getSourceById(id, token);
  }
}
