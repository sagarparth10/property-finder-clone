import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmService } from '../crm/crm.service';
import { CreatePropertyDto } from './dto/property.dto';
import { Property } from './schemas/property.schema';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly crmService: CrmService,
  ) {}

  async findAll(query: any): Promise<{ items: Property[]; total: number }> {
    const {
      search,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      location,
      page = 1,
      limit = 20,
    } = query;

    const filter: any = { active: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (location) filter.location = { $regex: location, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      this.propertyModel.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }).exec(),
      this.propertyModel.countDocuments(filter),
    ]);
    return { items, total };
  }

  async findOne(id: string): Promise<Property> {
    return this.propertyModel.findById(id).exec();
  }

  async findByAgent(agentId: string): Promise<Property[]> {
    return this.propertyModel.find({ agentId, active: true }).sort({ createdAt: -1 }).exec();
  }

  async create(createPropertyDto: CreatePropertyDto, user: any): Promise<{ property: Property; matching: any }> {
    const agentId = String(user._id);
    const createdProperty = await this.propertyModel.create({
      ...createPropertyDto,
      latitude: createPropertyDto.latitude ?? 25.2048,
      longitude: createPropertyDto.longitude ?? 55.2708,
      agentId,
      agent: { name: user.name, email: user.email, phone: user.phone },
      verified: false,
      availability: 'available',
      active: true,
    });
    const matching = await this.crmService.onListingCreated(createdProperty, agentId);
    return { property: createdProperty, matching };
  }

  async update(id: string, updatePropertyDto: any): Promise<Property> {
    return this.propertyModel.findByIdAndUpdate(id, updatePropertyDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.propertyModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
  }

  async naturalLanguageSearch(query: string): Promise<Property[]> {
    const { items } = await this.findAll({ search: query });
    return items;
  }
}
