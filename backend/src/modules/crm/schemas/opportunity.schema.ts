import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OpportunityDocument = Opportunity & Document;

@Schema({ timestamps: true })
export class Opportunity {
  @Prop({ required: true })
  name: string;

  @Prop()
  leadId?: string;

  @Prop()
  propertyId?: string;

  @Prop({
    default: 'discovery',
    enum: ['discovery', 'qualified', 'quoted', 'negotiation', 'won', 'lost'],
  })
  stage: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 'AED' })
  currency: string;

  @Prop({ default: 10 })
  probability: number;

  @Prop({ required: true })
  ownerUserId: string;

  @Prop({ default: 'inquiry' })
  source: string;

  @Prop({ default: 'Qualify budget and viewing' })
  nextStep: string;

  @Prop()
  contactName?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  lostReason?: string;
}

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
OpportunitySchema.index({ ownerUserId: 1, stage: 1 });
