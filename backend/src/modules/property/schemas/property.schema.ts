import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['rent', 'sale'] })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  bedrooms: number;

  @Prop({ required: true })
  bathrooms: number;

  @Prop({ required: true })
  area: number; // in square feet

  @Prop({ default: false })
  furnished: boolean;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ required: true })
  agentId: string;

  @Prop()
  developer?: string;

  @Prop({ default: 'available', enum: ['available', 'pending', 'sold', 'rented'] })
  availability: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Object })
  floorPlan?: any;

  @Prop({ type: Object })
  agent: any;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

// Indexes
PropertySchema.index({ location: 'text', title: 'text', description: 'text' });
PropertySchema.index({ latitude: 1, longitude: 1 });
PropertySchema.index({ price: 1, bedrooms: 1, bathrooms: 1 });

