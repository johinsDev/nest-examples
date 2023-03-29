import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type TokenDocument = HydratedDocument<Token>;

@Schema({
  timestamps: true,
})
export class Token {
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
  tokenType: string;

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

export const TokenSchema = SchemaFactory.createForClass(Token);
