import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth-password.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
