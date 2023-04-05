import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type LoginTokenDocument = HydratedDocument<LoginToken>;

@Schema({
  timestamps: true,
})
export class LoginToken {
  @Prop({
    unique: true,
    index: true,
  })
  token: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({
    type: Date,
  })
  expiresAt: Date;

  @Prop({
    type: String,
  })
  LogintokenType: string;

  @Prop({
    type: Map,
    of: String,
  })
  meta: Map<string, string>;

  @Prop({
    type: String,
  })
  previewChars: string;
}

export const LoginTokenSchema = SchemaFactory.createForClass(LoginToken);
