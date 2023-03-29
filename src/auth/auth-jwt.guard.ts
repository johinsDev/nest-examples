import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from './entities/user.schema';

export interface JwtDto {
  userId?: string | null;
  tokenId?: string;
}

export interface ReqAuth extends Request {
  user: User;
  payloadToken: JwtDto;
  token: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const authorization = request.headers['authorization'];

      if (!authorization) {
        return false;
      }

      const [, token] = authorization.split(' ');

      const payload = await this.jwt.verifyAsync(token);

      if (!payload) {
        return false;
      }

      const user = await this.authService.validateApiToken({
        userId: payload.userId,
        tokenId: payload.tokenId,
        token,
      });

      request.user = user;
      request.token = token;
      request.payloadToken = payload;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}
