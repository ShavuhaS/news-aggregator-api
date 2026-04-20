import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: `${configService.get<string>('baseUrl')}/auth/google/callback`,
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, photos, displayName } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      username:
        displayName.replace(/\s+/g, '').toLowerCase() + id.substring(0, 4),
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
