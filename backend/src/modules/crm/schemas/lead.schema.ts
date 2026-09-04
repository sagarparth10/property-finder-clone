import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UNASSIGNED_OWNER_ID } from '../domain';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ default: '' })
  company: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ default: 'Buyer' })
  title: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 'Dubai' })
  territory: string;

  @Prop({ default: 'UAE' })
  region: string;

  @Prop({ default: 'AE' })
  country: string;

  @Prop({ default: 'portal' })
  source: string;

  @Prop({
    default: 'new',
    enum: ['new', 'working', 'nurture', 'qualified', 'converted', 'disqualified'],
  })
  status: string;

  @Prop({ default: 0 })
  estimatedAmount: number;

  @Prop({ enum: ['rent', 'sale', ''], default: '' })
  intent: string;

  @Prop({ default: '' })
  locationPreference: string;

  @Prop({ default: 0 })
  bedrooms: number;

  @Prop()
  propertyId?: string;

  @Prop({ type: [String], default: [] })
  suggestedPropertyIds: string[];

  @Prop()
  notes?: string;

  @Prop({ default: UNASSIGNED_OWNER_ID })
  ownerUserId: string;

  @Prop()
  claimedAt?: Date;

  @Prop()
  lastContactedAt?: Date;

  @Prop()
  transferredFromUserId?: string;

  @Prop()
  convertedOpportunityId?: string;

  @Prop()
  convertedAt?: Date;

  @Prop()
  buyerUserId?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ ownerUserId: 1, status: 1 });
LeadSchema.index({ email: 1, propertyId: 1 });
LeadSchema.index({ locationPreference: 1, intent: 1 });
