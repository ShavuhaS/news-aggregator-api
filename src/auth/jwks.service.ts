import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import * as crypto from 'crypto';

@Injectable()
export class JwksService implements OnModuleInit {
  private jwk: any;
  private kid: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const publicKeyPem = this.configService.get<string>(
      'jwt.publicKey',
    ) as string;

    const publicKey = crypto.createPublicKey(publicKeyPem);

    this.jwk = await jose.exportJWK(publicKey);

    this.kid = crypto
      .createHash('sha256')
      .update(publicKeyPem)
      .digest('hex')
      .substring(0, 16);

    this.jwk.kid = this.kid;
    this.jwk.alg = 'RS256';
    this.jwk.use = 'sig';
  }

  getJwks() {
    return {
      keys: [this.jwk],
    };
  }

  getKid() {
    return this.kid;
  }
}
