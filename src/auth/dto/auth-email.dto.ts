import { IsEmail, IsJWT, IsString } from 'class-validator';
import { IsUniqueEmail } from 'src/validation/unique-email';

export class CreateAuthEmailDto {
  @IsUniqueEmail()
  @IsEmail()
  email: string;
}

export class SingInAuthEmailDto {
  @IsEmail()
  email: string;
}

export class VerifyAuthEmailDto extends SingInAuthEmailDto {
  @IsString()
  @IsJWT()
  token: string;
}
