import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-token')
  async verifyToken(@Body() body: { idToken: string; provider: string }) {
    try {
      return await this.authService.verifyToken(body.idToken, body.provider);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('telegram')
  async telegramAuth(@Query() query: any) {
    try {
      return await this.authService.verifyTelegramAuth(query);
    } catch (error) {
      throw new HttpException('Invalid authentication', HttpStatus.FORBIDDEN);
    }
  }

  @Post('anonymous')
  async anonymousAuth(@Body() body: { idToken: string }) {
    try {
      return await this.authService.verifyAnonymousAuth(body.idToken);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
