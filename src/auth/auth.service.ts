import {
  HttpException,
  HttpExceptionOptions,
  Injectable,
  Scope,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Token, TokenDocument } from './entities/token.schema';
import { User, UserDocument } from './entities/user.schema';
import { HashService } from './hash.service';
import { PasswordService } from './password.service';

class AuthenticationException extends HttpException {
  constructor(
    response: string | Record<string, any>,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super(response, status, options);
  }

  static invalidPassword() {
    return new AuthenticationException('Invalid password', 401, {
      description: 'Invalid password',
    });
  }

  static userNotFound() {
    return new AuthenticationException('User not found', 404, {
      description: 'User not found',
    });
  }

  static notAuthorized() {
    return new AuthenticationException('Not authorized', 401, {
      description: 'Not authorized',
    });
  }
}

const TOKEN_PREVIEW_LENGTH = 8;

@Injectable({
  scope: Scope.REQUEST,
})
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly hashService: HashService,
    private readonly passwordService: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  private _token: TokenDocument | null = null;
  private _user: UserDocument | null = null;

  get token() {
    return this._token;
  }

  get user() {
    return this._user;
  }

  async validateApiToken({
    userId,
    tokenId,
    token: tokenProp,
  }: {
    userId: string;
    tokenId: string;
    token: string;
  }) {
    const token = await this.tokenModel.findOne({
      _id: tokenId,
      user: userId,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      throw AuthenticationException.notAuthorized();
    }

    const isValid = await this.passwordService.validatePassword(
      tokenProp,
      token.token,
    );

    if (!isValid) {
      throw AuthenticationException.notAuthorized();
    }

    const user = await this.userModel
      .findOne({ _id: token.user })
      .select(['-password', '-__v', '-createdAt', '-updatedAt']);

    if (!user) {
      throw AuthenticationException.notAuthorized();
    }

    this._token = token;
    this._user = user;

    return user;
  }

  async singIn(email: string, password: string) {
    // find user by email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw AuthenticationException.userNotFound();
    }

    // compare password (password service)
    const isValidPassword = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw AuthenticationException.invalidPassword();
    }

    // create jwt token
    const tokenId = new mongoose.Types.ObjectId();

    const token = this.jwt.sign({
      tokenId,
      userId: user._id,
    });

    const previewChars = token.slice(-TOKEN_PREVIEW_LENGTH);

    // hash token
    const hashedToken = await this.passwordService.hashPassword(token);

    const apiToken = await this.tokenModel.create({
      _id: tokenId,
      token: hashedToken,
      previewChars,
      user: user._id,
      // TODO use ms from zeit/ms
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      tokenType: 'access',
      meta: {},
    });

    apiToken.token = token;

    return {
      token: apiToken.token,
      expiresAt: apiToken.expiresAt,
      meta: apiToken.meta,
    };
  }

  async create(createAuthDto: CreateAuthDto) {
    return this.userModel.create({
      email: createAuthDto.email,
      password: await this.hashService.hash(createAuthDto.password),
    });
  }

  signOut() {
    return this.tokenModel.findOneAndDelete({
      _id: this.token._id,
    });
  }
}
