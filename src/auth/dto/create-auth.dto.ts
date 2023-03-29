import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsUniqueEmail } from 'src/validation/unique-email';

export class CreateAuthDto {
  @IsUniqueEmail()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
