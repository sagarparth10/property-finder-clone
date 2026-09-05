import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Agent } from '../agent/schemas/agent.schema';
import { UNASSIGNED_OWNER_ID, scoreListingToLead } from '../crm/domain';
import { Lead } from '../crm/schemas/lead.schema';
import { Suggestion } from '../crm/schemas/suggestion.schema';
import { Property } from '../property/schemas/property.schema';
import { User } from '../user/schemas/user.schema';

const DEMO_PASSWORD = 'Demo1234!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    @InjectModel(Suggestion.name) private suggestionModel: Model<Suggestion>,
  ) {}

  async onModuleInit() {
    try {
      await this.seed();
    } catch (err) {
      this.logger.error(`Demo seed failed: ${err?.message || err}`);
    }
  }

  private async seed() {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    await this.userModel.updateMany(
      {
        email: {
          $in: [
            'maya.buyer@propertynexus.ai',
            'john.dealer@propertynexus.ai',
            'sarah.dealer@propertynexus.ai',
            'amira.broker@propertynexus.ai',
            'admin@propertynexus.ai',
          ],
        },
      },
      { $set: { password } },
    );

    const existing = await this.userModel.findOne({ email: 'john.dealer@propertynexus.ai' });
    if (existing && (await this.propertyModel.countDocuments()) > 0) {
      if ((await this.suggestionModel.countDocuments()) === 0) {
        await this.seedMatches();
      }
      this.logger.log('Demo data already present');
      return;
    }

    const upsertUser = async (data: Partial<User> & { email: string; name: string; role: string }) => {
      const found = await this.userModel.findOne({ email: data.email });
      if (found) return found;
      return this.userModel.create({ ...data, password, active: true });
    };

    const buyer = await upsertUser({
      email: 'maya.buyer@propertynexus.ai',
      name: 'Maya Al Farsi',
      role: 'user',
      phone: '+971 50 111 2222',
      territory: 'Dubai',
    } as any);
    const john = await upsertUser({
      email: 'john.dealer@propertynexus.ai',
      name: 'John Smith',
      role: 'agent',
      phone: '+971 50 123 4567',
      territory: 'Dubai Marina',
    } as any);
    const sarah = await upsertUser({
      email: 'sarah.dealer@propertynexus.ai',
      name: 'Sarah Johnson',
      role: 'agent',
      phone: '+971 50 765 4321',
      territory: 'Palm Jumeirah',
    } as any);
    await upsertUser({
      email: 'amira.broker@propertynexus.ai',
      name: 'Amira Haddad',
      role: 'broker',
      phone: '+971 50 888 0000',
      territory: 'Dubai',
    } as any);
    await upsertUser({
      email: 'admin@propertynexus.ai',
      name: 'Platform Admin',
      role: 'admin',
      phone: '+971 50 000 0001',
      territory: 'UAE',
    } as any);

    const ensureAgent = async (user: any, extra: Partial<Agent>) => {
      const found = await this.agentModel.findOne({ userId: String(user._id) });
      if (found) return found;
      return this.agentModel.create({
        userId: String(user._id),
        active: true,
        ...extra,
      });
    };

    await ensureAgent(john, {
      specialization: 'Residential & Marina',
      experience: '8 years',
      languages: ['English', 'Arabic', 'Hindi'],
      rating: 4.8,
      successRate: 92,
    });
    await ensureAgent(sarah, {
      specialization: 'Luxury waterfront',
      experience: '12 years',
      languages: ['English', 'French'],
      rating: 4.9,
      successRate: 96,
    });

    const johnId = String(john._id);
    const sarahId = String(sarah._id);

    if ((await this.propertyModel.countDocuments()) === 0) {
      await this.propertyModel.insertMany([
        {
          title: 'Luxurious 2BR Apartment in Dubai Marina',
          description: 'Stunning 2-bedroom apartment with marina views. Modern amenities and premium finishes.',
          type: 'rent',
          price: 85000,
          location: 'Dubai Marina, Dubai',
          latitude: 25.0762,
          longitude: 55.1352,
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          furnished: true,
          verified: true,
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
          amenities: ['Gym', 'Pool', 'Parking', 'Balcony', 'Security'],
          agentId: johnId,
          developer: 'Emaar Properties',
          availability: 'available',
          active: true,
          agent: { name: 'John Smith', email: 'john.dealer@propertynexus.ai' },
        },
        {
          title: 'Modern 1BR Studio in Downtown',
          description: 'Contemporary studio apartment in the heart of Downtown Dubai.',
          type: 'rent',
          price: 55000,
          location: 'Downtown Dubai',
          latitude: 25.1972,
          longitude: 55.2744,
          bedrooms: 1,
          bathrooms: 1,
          area: 650,
          furnished: true,
          verified: false,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          amenities: ['Gym', 'Rooftop', 'Security', 'Balcony'],
          agentId: johnId,
          availability: 'available',
          active: true,
          agent: { name: 'John Smith', email: 'john.dealer@propertynexus.ai' },
        },
        {
          title: 'Spacious 3BR Villa in Jumeirah',
          description: 'Beautiful 3-bedroom villa with private garden and pool. Perfect for families.',
          type: 'sale',
          price: 1200000,
          location: 'Jumeirah, Dubai',
          latitude: 25.1969,
          longitude: 55.2444,
          bedrooms: 3,
          bathrooms: 3,
          area: 2800,
          furnished: false,
          verified: true,
          images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
          amenities: ['Garden', 'Pool', 'Parking', 'Maid Room', 'Storage'],
          agentId: sarahId,
          developer: 'Nakheel Properties',
          availability: 'available',
          active: true,
          agent: { name: 'Sarah Johnson', email: 'sarah.dealer@propertynexus.ai' },
        },
        {
          title: 'Premium 4BR Penthouse in Palm Jumeirah',
          description: 'Exclusive penthouse with panoramic sea views and premium finishes.',
          type: 'sale',
          price: 2500000,
          location: 'Palm Jumeirah, Dubai',
          latitude: 25.1162,
          longitude: 55.1365,
          bedrooms: 4,
          bathrooms: 4,
          area: 4500,
          furnished: true,
          verified: true,
          images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          ],
          amenities: ['Gym', 'Pool', 'Beach', 'Concierge', 'Parking'],
          agentId: sarahId,
          developer: 'Damac Properties',
          availability: 'available',
          active: true,
          agent: { name: 'Sarah Johnson', email: 'sarah.dealer@propertynexus.ai' },
        },
      ]);
    }

    if ((await this.leadModel.countDocuments()) === 0) {
      await this.leadModel.insertMany([
        {
          firstName: 'Maya',
          lastName: 'Al Farsi',
          email: 'maya.buyer@propertynexus.ai',
          phone: '+971 50 111 2222',
          territory: 'Dubai Marina',
          locationPreference: 'Dubai Marina',
          intent: 'rent',
          bedrooms: 2,
          estimatedAmount: 90000,
          source: 'portal',
          status: 'new',
          ownerUserId: UNASSIGNED_OWNER_ID,
          buyerUserId: String(buyer._id),
          notes: 'Wants marina view, furnished, gym + pool.',
        },
        {
          firstName: 'Omar',
          lastName: 'Khan',
          email: 'omar.khan@example.com',
          phone: '+971 55 222 3333',
          territory: 'Downtown Dubai',
          locationPreference: 'Downtown Dubai',
          intent: 'rent',
          bedrooms: 1,
          estimatedAmount: 60000,
          source: 'portal',
          status: 'new',
          ownerUserId: UNASSIGNED_OWNER_ID,
          notes: 'Relocating for work. Needs metro access.',
        },
        {
          firstName: 'Priya',
          lastName: 'Mehta',
          email: 'priya.mehta@example.com',
          phone: '+971 52 444 5555',
          territory: 'Jumeirah',
          locationPreference: 'Jumeirah',
          intent: 'sale',
          bedrooms: 3,
          estimatedAmount: 1300000,
          source: 'manual',
          status: 'new',
          ownerUserId: UNASSIGNED_OWNER_ID,
          notes: 'Family villa with garden. School catchment matters.',
        },
        {
          firstName: 'Luca',
          lastName: 'Bianchi',
          email: 'luca.bianchi@example.com',
          phone: '+971 50 777 8888',
          territory: 'Palm Jumeirah',
          locationPreference: 'Palm Jumeirah',
          intent: 'sale',
          bedrooms: 4,
          estimatedAmount: 2600000,
          source: 'portal',
          status: 'new',
          ownerUserId: UNASSIGNED_OWNER_ID,
          notes: 'UHNW buyer, sea view penthouse.',
        },
      ]);
    }

    if ((await this.suggestionModel.countDocuments()) === 0) {
      await this.seedMatches();
    }

    this.logger.log('Demo seed ready — dealer john.dealer@propertynexus.ai / Demo1234!');
  }

  private async seedMatches() {
    const listings = await this.propertyModel.find({ active: true });
    const leads = await this.leadModel.find({ status: { $nin: ['converted', 'disqualified'] } });
    for (const listing of listings) {
      for (const lead of leads) {
        const { score, reasons } = scoreListingToLead(
          {
            id: String(listing._id),
            title: listing.title,
            type: listing.type,
            price: listing.price,
            location: listing.location,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            agentId: listing.agentId,
          },
          {
            id: String(lead._id),
            intent: lead.intent,
            locationPreference: lead.locationPreference || lead.territory,
            bedrooms: lead.bedrooms,
            estimatedAmount: lead.estimatedAmount,
          },
        );
        if (score < 40) continue;
        await this.suggestionModel.updateOne(
          { propertyId: String(listing._id), leadId: String(lead._id) },
          {
            $set: {
              propertyId: String(listing._id),
              leadId: String(lead._id),
              agentId: listing.agentId,
              score,
              reasons,
              kind: 'listing_match',
              status: 'new',
            },
          },
          { upsert: true },
        );
      }
    }
  }
}
