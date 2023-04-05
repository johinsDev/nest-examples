import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthEmailService } from '../auth-email.service';
import {
  CreateAuthEmailDto,
  SingInAuthEmailDto,
  VerifyAuthEmailDto,
} from '../dto/auth-email.dto';

@Controller('auth/email')
export class AuthEmailController {
  constructor(private readonly authService: AuthEmailService) {}

  @Post('/')
  signup(@Body() body: CreateAuthEmailDto) {
    return this.authService.create(body);
  }

  @Post('/sign-in')
  signin(@Body() body: SingInAuthEmailDto) {
    return this.authService.attempt(body);
  }

  @Get('/verify')
  verify(@Query() query: VerifyAuthEmailDto) {
    return this.authService.verify(query);
  }
}
