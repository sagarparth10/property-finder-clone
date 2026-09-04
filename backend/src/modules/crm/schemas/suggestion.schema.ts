import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SuggestionDocument = Suggestion & Document;

@Schema({ timestamps: true })
export class Suggestion {
  @Prop({ required: true })
  propertyId: string;

  @Prop({ required: true })
  leadId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  score: number;

  @Prop({ type: [String], default: [] })
  reasons: string[];

  @Prop({ default: 'new', enum: ['new', 'viewed', 'accepted', 'dismissed'] })
  status: string;

  @Prop({ default: 'listing_match' })
  kind: string;
}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);
SuggestionSchema.index({ agentId: 1, status: 1 });
SuggestionSchema.index({ propertyId: 1, leadId: 1 }, { unique: true });
