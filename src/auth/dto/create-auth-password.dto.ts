import { IsString, MinLength } from 'class-validator';
import { CreateAuthEmailDto } from './auth-email.dto';

export class CreateAuthDto extends CreateAuthEmailDto {
  @IsString()
  @MinLength(6)
  password: string;
}
