import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueEmail } from 'src/validation/unique-email';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenSchema } from './entities/token.schema';
import { UserSchema } from './entities/user.schema';
import { HashService } from './hash.service';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';

@Module({
  controllers: [AuthController],
  providers: [
    UniqueEmail,
    AuthService,
    HashService,
    PasswordService,
    JwtStrategy,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      {
        name: 'Token',
        schema: TokenSchema,
      },
    ]),
    JwtModule.register({
      secret: 'secret',
    }),
  ],
})
export class AuthModule {}
