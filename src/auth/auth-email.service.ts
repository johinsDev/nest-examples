import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import * as ms from 'ms';
import { AuthenticationException } from './auth.exception';
import { CreateAuthEmailDto, VerifyAuthEmailDto } from './dto/auth-email.dto';
import { LoginToken, LoginTokenDocument } from './entities/login-token.schema';
import { User, UserDocument } from './entities/user.schema';
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
    @InjectModel(LoginToken.name)
    private loginTokenModel: Model<LoginTokenDocument>,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
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

    const apiToken = await this.loginTokenModel.create({
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

    const loginToken = await this.loginTokenModel.findOne({
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

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }

  async signin(data: CreateAuthEmailDto) {
    const user = await this.userModel.findOne({
      email: data.email,
    });

    if (!user) {
      throw AuthenticationException.userNotFound();
    }

    const tokens = this.loginTokenModel.find({
      user: user._id,
    });

    await tokens.deleteMany();

    const token = await this.createToken(user);

    // TODO: emit event to send email with token

    const params = new URLSearchParams();

    params.append('token', token.token);
    params.append('email', user.email);

    const url = new URL(
      `/auth/email/verify?${params.toString()}`,
      'http://localhost:3000',
    );

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
}