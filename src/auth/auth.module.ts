import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwksController } from './jwks.controller';
import { JwksService } from './jwks.service';
import { AuthMapper } from './auth.mapper';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    JwksService,
    AuthMapper,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    RefreshJwtStrategy,
  ],
  controllers: [AuthController, JwksController],
  exports: [AuthService, JwksService, AuthMapper],
})
export class AuthModule {}
