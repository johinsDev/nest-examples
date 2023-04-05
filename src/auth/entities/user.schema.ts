import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    unique: true,
    index: true,
  })
  email: string;

  @Prop({
    select: false,
  })
  password: string;

  @Prop()
  name: string;

  @Prop({
    type: Date,
    select: false,
  })
  emailVerified: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
