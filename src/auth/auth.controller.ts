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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
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
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: TokensResponse })
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
  @ApiOperation({ summary: 'Login with username or email' })
  @ApiResponse({ status: 200, type: TokensResponse })
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponse> {
    const tokens = await this.authService.login(req.user);
    this.setCookies(res, tokens);
    return this.authMapper.toTokensResponse(tokens);
  }

  @UseGuards(RefreshAuthGuard)
  @ApiCookieAuth('refreshToken')
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: TokensResponse })
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponse> {
    const tokens = await this.authService.refreshTokens(req.user);
    this.setCookies(res, tokens);
    return this.authMapper.toTokensResponse(tokens);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookies' })
  @ApiResponse({ status: 204 })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth/refresh' });
  }

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth2 flow' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user);
    this.setCookies(res, tokens);
    return res.redirect(this.frontendUrl);
  }
}
