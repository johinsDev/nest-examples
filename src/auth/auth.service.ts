import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  EVENT_AUTHENTICATED,
  EVENT_LOGGED_OUT,
  EVENT_LOGIN,
} from './auth.constants';
import { AuthenticationException } from './auth.exception';
import { CreateAuthDto } from './dto/create-auth-password.dto';
import { LoginToken, LoginTokenDocument } from './entities/token.schema';
import { User, UserDocument } from './entities/user.schema';
import { HashService } from './hash.service';

const TOKEN_PREVIEW_LENGTH = 8;

@Injectable({
  scope: Scope.REQUEST,
})
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(LoginToken.name) private tokenModel: Model<LoginTokenDocument>,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
    private emitter: EventEmitter2,
  ) {}

  public token: LoginTokenDocument | null = null;
  public user: UserDocument | null = null;
  public isLoggedOut = false;
  public isAuthenticated = false;
  public authenticationAttempted = false;

  private getLoginEventData(user: UserDocument, token: LoginTokenDocument) {
    return {
      user,
      token,
    };
  }

  async authenticate({
    userId,
    tokenId,
    token: tokenProp,
  }: {
    userId: string;
    tokenId: string;
    token: string;
  }) {
    if (this.authenticationAttempted) {
      return this.user;
    }

    this.authenticationAttempted = true;

    const token = await this.tokenModel.findOne({
      _id: tokenId,
      user: userId,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      throw AuthenticationException.notAuthorized();
    }

    const isValid = await this.hashService.compare(tokenProp, token.token);

    if (!isValid) {
      throw AuthenticationException.notAuthorized();
    }

    const user = await this.userModel.findOne({ _id: token.user });

    if (!user) {
      throw AuthenticationException.notAuthorized();
    }

    this.markUserAsLoggedIn(user, token);

    this.emitter.emit(EVENT_AUTHENTICATED, this.getLoginEventData(user, token));

    return user;
  }

  protected markUserAsLoggedIn(
    user: UserDocument,
    apiToken: LoginTokenDocument,
    authenticated?: boolean,
  ) {
    this.token = apiToken;
    this.user = user;
    this.isLoggedOut = false;
    this.isAuthenticated = authenticated ?? false;
  }

  async login(user: UserDocument): Promise<any> {
    // create jwt token
    const tokenId = new mongoose.Types.ObjectId();

    const token = this.jwt.sign({
      tokenId,
      userId: user._id,
    });

    const previewChars = token.slice(-TOKEN_PREVIEW_LENGTH);

    // hash token
    const hashedToken = await this.hashService.hash(token);

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

    this.markUserAsLoggedIn(user, apiToken, true);

    this.emitter.emit(EVENT_LOGIN, this.getLoginEventData(user, apiToken));

    return {
      token: apiToken.token,
      expiresAt: apiToken.expiresAt,
      meta: apiToken.meta,
    };
  }

  async attempt(email: string, password: string) {
    if (!email || !password) {
      throw AuthenticationException.invalidUid();
    }

    // find user by email
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw AuthenticationException.userNotFound();
    }

    // compare password (password service)
    const isValidPassword = await this.hashService.compare(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw AuthenticationException.invalidPassword();
    }

    return this.login(user);
  }

  async create(createAuthDto: CreateAuthDto) {
    const user = await this.userModel.create({
      email: createAuthDto.email,
      password: await this.hashService.hash(createAuthDto.password),
    });

    return {
      email: user.email,
      name: user.name,
    };
  }

  private markUserAsLoggedOut() {
    this.token = null;
    this.user = null;
    this.isLoggedOut = true;
    this.isAuthenticated = false;
  }

  async signOut() {
    await this.tokenModel.findOneAndDelete({
      _id: this.token._id,
    });

    this.markUserAsLoggedOut();

    this.emitter.emit(
      EVENT_LOGGED_OUT,
      this.getLoginEventData(this.user, this.token),
    );
  }
}
