import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueEmail } from 'src/validation/unique-email';
import { AuthEmailController } from './auth-email.controller';
import { AuthEmailService } from './auth-email.service';
import { AuthPasswordController } from './auth-password.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginToken, LoginTokenSchema } from './entities/token.schema';
import { User, UserSchema } from './entities/user.schema';
import { VerifyToken, VerifyTokenSchema } from './entities/verify-token.schema';
import { HashService } from './hash.service';
import { PasswordService } from './password.service';

@Module({
  controllers: [AuthPasswordController, AuthEmailController, AuthController],
  providers: [
    UniqueEmail,
    AuthEmailService,
    AuthService,
    HashService,
    PasswordService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: VerifyToken.name,
        schema: VerifyTokenSchema,
      },
      {
        name: LoginToken.name,
        schema: LoginTokenSchema,
      },
    ]),
    JwtModule.register({
      secret: 'secret',
    }),
  ],
})
export class AuthModule {}
