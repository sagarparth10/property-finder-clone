import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'user', enum: ['user', 'agent', 'broker', 'lawyer', 'mortgage', 'admin'] })
  role: string;

  @Prop()
  phone?: string;

  @Prop({ default: 'Dubai' })
  territory?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: Object })
  preferences?: any;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

