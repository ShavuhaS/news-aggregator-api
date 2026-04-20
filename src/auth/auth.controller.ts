import { Controller, Get } from '@nestjs/common';
import { JwksService } from './jwks.service';

@Controller()
export class AuthController {
  constructor(private readonly jwksService: JwksService) {}

  @Get('.well-known/jwks.json')
  getJwks() {
    return this.jwksService.getJwks();
  }
}
