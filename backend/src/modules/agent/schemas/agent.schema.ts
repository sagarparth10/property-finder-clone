import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop()
  specialization?: string;

  @Prop()
  experience?: string;

  @Prop({ default: 0 })
  listings: number;

  @Prop({ default: 0 })
  successRate: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ default: true })
  active: boolean;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

