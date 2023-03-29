import { Global, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Connection } from 'mongoose';

@Global()
@ValidatorConstraint({ name: 'unique-email', async: true })
@Injectable()
export class UniqueEmail implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private connection: Connection) {}

  async validate(email: string) {
    const model = this.connection.model('User');

    const row = await model.exists({ email });

    return !row?._id;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Email ${validationArguments.value} is already taken.`;
  }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueEmail,
      name: 'unique-email',
    });
  };
}
