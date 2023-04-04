import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from './auth-jwt.guard';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth-password.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth/password')
export class AuthPasswordController {
  constructor(private readonly authService: AuthService) {}

  // Password auth
  @Post('sign-up')
  signupPassword(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('sign-in')
  signInPassword(@Body() body: SignInDto) {
    return this.authService.singIn(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me() {
    return this.authService.user;
  }

  @UseGuards(AuthGuard)
  @Delete('sign-out')
  async signOutPassword(@Res() res: Response) {
    await this.authService.signOut();

    res.status(204).send();
  }
}
