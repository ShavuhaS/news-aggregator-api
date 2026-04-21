import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwksService } from './jwks.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SafeUser } from '../user/interfaces/user.interface';
import { User } from '@prisma/client';
import { TokensResponse } from './responses/tokens.response';
import { RegisterData } from './interfaces/auth.interface';
import { GoogleLoginData } from './interfaces/google-login-data.interface';

@Injectable()
export class AuthService {
  private readonly privateKey: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private jwksService: JwksService,
  ) {
    this.privateKey = this.configService.get<string>('jwt.privateKey')!;
    this.accessTokenExpiresIn = this.configService.get<string>(
      'jwt.accessTokenExpiresIn',
    )!;
    this.refreshTokenExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
    )!;
  }

  async validateUser(
    identifier: string,
    pass: string,
  ): Promise<SafeUser | null> {
    const user = await this.userService.findByEmailOrUsername(identifier);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getTokens(user: SafeUser | User): Promise<TokensResponse> {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    const kid = this.jwksService.getKid();

    const signOptions: JwtSignOptions = {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      keyid: kid,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        ...signOptions,
        expiresIn: this.accessTokenExpiresIn,
      } as JwtSignOptions),
      this.jwtService.signAsync(payload, {
        ...signOptions,
        expiresIn: this.refreshTokenExpiresIn,
      } as JwtSignOptions),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: SafeUser | User): Promise<TokensResponse> {
    return this.getTokens(user);
  }

  async register(data: RegisterData): Promise<TokensResponse> {
    const user = await this.userService.create({
      email: data.email,
      password: data.password,
      username: data.username,
    });
    return this.login(user);
  }

  async googleLogin(data: GoogleLoginData): Promise<TokensResponse> {
    let user = await this.userService.findByEmail(data.email);

    if (!user) {
      user = await this.userService.create({
        email: data.email,
        username: data.username,
        googleId: data.googleId,
      });
    } else if (!user.googleId) {
      user = await this.userService.update(user.id, {
        googleId: data.googleId,
      });
    }

    return this.login(user);
  }

  async refreshTokens(user: SafeUser | User): Promise<TokensResponse> {
    return this.getTokens(user);
  }
}
