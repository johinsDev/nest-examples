import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard, ReqAuth } from './auth-jwt.guard';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Password auth
  @Post('password/sign-up')
  signupPassword(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('password/sign-in')
  signInPassword(@Body() body: SignInDto) {
    return this.authService.singIn(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: ReqAuth) {
    return this.authService.user;
  }

  @UseGuards(AuthGuard)
  @Delete('password/sign-out')
  async signOutPassword(@Req() req: ReqAuth, @Res() res: Response) {
    await this.authService.signOut();

    res.status(204).send();
  }
}
