import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueEmail } from 'src/validation/unique-email';
import { AuthEmailController } from './auth-email.controller';
import { AuthEmailService } from './auth-email.service';
import { AuthPasswordController } from './auth-password.controller';
import { AuthService } from './auth.service';
import { LoginTokenSchema } from './entities/login-token.schema';
import { TokenSchema } from './entities/token.schema';
import { UserSchema } from './entities/user.schema';
import { HashService } from './hash.service';
import { PasswordService } from './password.service';

@Module({
  controllers: [AuthPasswordController, AuthEmailController],
  providers: [
    UniqueEmail,
    AuthEmailService,
    AuthService,
    HashService,
    PasswordService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      {
        name: 'Token',
        schema: TokenSchema,
      },
      {
        name: 'LoginToken',
        schema: LoginTokenSchema,
      },
    ]),
    JwtModule.register({
      secret: 'secret',
    }),
  ],
})
export class AuthModule {}
