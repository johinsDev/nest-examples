import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueEmail } from 'src/validation/unique-email';
import { AuthEmailService } from './auth-email.service';
import { AuthService } from './auth.service';
import { AuthEmailController } from './controllers/auth-email.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { AuthController } from './controllers/auth.controller';
import { LoginToken, LoginTokenSchema } from './entities/token.schema';
import { User, UserSchema } from './entities/user.schema';
import { VerifyToken, VerifyTokenSchema } from './entities/verify-token.schema';
import { HashService } from './hash.service';

@Module({
  controllers: [AuthPasswordController, AuthEmailController, AuthController],
  providers: [UniqueEmail, AuthEmailService, AuthService, HashService],
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
