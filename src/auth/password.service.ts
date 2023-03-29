import { Injectable } from '@nestjs/common';
import { HashService } from './hash.service';

@Injectable()
export class PasswordService {
  constructor(private readonly hashService: HashService) {}

  hashPassword(password: string): Promise<string> {
    return this.hashService.hash(password);
  }

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return this.hashService.compare(password, hashedPassword);
  }
}
