import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { User } from './entities/user.schema';

export interface JwtDto {
  userId?: string | null;
  tokenId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: 'secret',
    });
  }

  async validate(req, payload: JwtDto): Promise<User> {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    return this.authService.validateApiToken({
      userId: payload.userId,
      tokenId: payload.tokenId,
      token: jwt,
    });
  }
}
