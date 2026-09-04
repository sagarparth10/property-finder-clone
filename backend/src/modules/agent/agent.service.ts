import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../property/schemas/property.schema';
import { Agent } from './schemas/agent.schema';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.agentModel.find({ active: true }).populate('userId').exec();
  }

  async findOne(id: string): Promise<Agent> {
    return this.agentModel.findById(id).populate('userId').exec();
  }

  async getListings(agentId: string) {
    const agent = await this.agentModel.findById(agentId);
    const userId = agent?.userId || agentId;
    return this.propertyModel.find({ agentId: String(userId), active: true }).sort({ createdAt: -1 }).exec();
  }

  async getAnalytics(agentId: string) {
    const listings = await this.getListings(agentId);
    return {
      listingCount: listings.length,
      forSale: listings.filter((l) => l.type === 'sale').length,
      forRent: listings.filter((l) => l.type === 'rent').length,
    };
  }
}
