import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import ms from 'ms';
import { EVENT_LOGIN_EMAIL } from './auth.constants';
import { AuthenticationException } from './auth.exception';
import { AuthService } from './auth.service';
import { CreateAuthEmailDto, VerifyAuthEmailDto } from './dto/auth-email.dto';
import { MagicLinkEmail } from './emails/magic-link.email';
import { User, UserDocument } from './entities/user.schema';
import {
  VerifyToken,
  VerifyTokenDocument,
} from './entities/verify-token.schema';
import { HashService } from './hash.service';

const EXPIRES_IN = '1h';

type TokenPayload = {
  id: string;
  tokenId: string;
};

@Injectable()
export class AuthEmailService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(VerifyToken.name)
    private verifyTokenModel: Model<VerifyTokenDocument>,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
    private readonly authService: AuthService,
    private readonly emitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  private async createToken(user: UserDocument) {
    const tokenId = new mongoose.Types.ObjectId();

    const token = this.jwt.sign(
      { id: user._id, tokenId },
      {
        expiresIn: EXPIRES_IN,
      },
    );

    const hashedToken = await this.hashService.hash(token);

    const apiToken = await this.verifyTokenModel.create({
      user: user._id,
      token: hashedToken,
      expiresAt: dayjs().add(ms(EXPIRES_IN), 'ms'),
      _id: tokenId,
    });

    apiToken.token = token;

    return apiToken;
  }

  async verify(params: VerifyAuthEmailDto) {
    const token = params.token;

    const email = params.email;

    const { tokenId } = this.jwt.decode(token) as TokenPayload;

    const loginToken = await this.verifyTokenModel.findOne({
      _id: tokenId,
    });

    if (!loginToken) {
      throw AuthenticationException.invalidToken();
    }

    if (dayjs().isAfter(loginToken.expiresAt)) {
      throw AuthenticationException.tokenExpired();
    }

    const hashedToken = loginToken.token;

    if (!(await this.hashService.compare(token, hashedToken))) {
      throw AuthenticationException.invalidToken();
    }

    const user = await this.userModel.findById(loginToken.user);

    if (!user) {
      throw AuthenticationException.userNotFound();
    }

    if (user.email !== email) {
      throw AuthenticationException.invalidToken();
    }

    await loginToken.deleteOne();

    return this.authService.login(user);
  }

  async attempt(data: CreateAuthEmailDto) {
    const user = await this.userModel.findOne({
      email: data.email,
    });

    if (!user) {
      throw AuthenticationException.userNotFound();
    }

    await this.verifyTokenModel
      .find({
        user: user._id,
      })
      .deleteMany();

    const token = await this.createToken(user);

    const params = new URLSearchParams();

    params.append('token', token.token);
    params.append('email', user.email);

    const url = new URL(
      `/auth/email/verify?${params.toString()}`,
      this.configService.get('auth.email.verify_host'),
    );

    this.emitter.emit(EVENT_LOGIN_EMAIL, {
      user,
      verifyToken: token,
      url: url.toString(),
    });

    return {
      url: url.toString(),
      token,
    };
  }

  async create(data: CreateAuthEmailDto) {
    const user = await this.userModel.create({
      email: data.email,
    });

    const token = await this.createToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }

  @OnEvent(EVENT_LOGIN_EMAIL)
  async onLoginEmail(data: {
    user: UserDocument;
    verifyToken: VerifyToken;
    url: string;
  }) {
    new MagicLinkEmail({
      name: data.user.name,
      email: data.user.email,
      url: data.url,
      token: data.verifyToken.token,
    }).later();
  }
}
