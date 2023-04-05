import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth-jwt.guard';
import { AuthService } from '../auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  me() {
    return this.authService.user;
  }
}
