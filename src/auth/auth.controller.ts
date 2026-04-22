import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwksService } from './jwks.service';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { TokensResponse } from './responses/tokens.response';
import { AuthMapper } from './auth.mapper';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './constants';

@Controller('auth')
export class AuthController {
  private env: string;
  private frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly jwksService: JwksService,
    private readonly configService: ConfigService,
    private readonly authMapper: AuthMapper,
  ) {
    this.env = this.configService.get<string>('env')!;
    this.frontendUrl = this.configService.get<string>('frontendUrl')!;
  }

  private setCookies(res: Response, tokens: TokensResponse) {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: this.env === 'production',
      sameSite: 'lax',
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: this.env === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
    });
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponse> {
    const tokens = await this.authService.register(registerDto);
    this.setCookies(res, tokens);
    return this.authMapper.toTokensResponse(tokens);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponse> {
    const tokens = await this.authService.login(req.user);
    this.setCookies(res, tokens);
    return this.authMapper.toTokensResponse(tokens);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponse> {
    const tokens = await this.authService.refreshTokens(req.user);
    this.setCookies(res, tokens);
    return this.authMapper.toTokensResponse(tokens);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user);
    this.setCookies(res, tokens);
    return res.redirect(this.frontendUrl);
  }
}
