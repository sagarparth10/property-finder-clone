import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../property/schemas/property.schema';
import { User } from '../user/schemas/user.schema';
import { canDo, isDealerRole } from '../../common/rbac/rbac';
import {
  isLeadInPool,
  OPPORTUNITY_STAGES,
  scoreListingToLead,
  UNASSIGNED_OWNER_ID,
} from './domain';
import { CreateLeadDto } from './dto/crm.dto';
import { Lead } from './schemas/lead.schema';
import { Opportunity } from './schemas/opportunity.schema';
import { Suggestion } from './schemas/suggestion.schema';

const MATCH_THRESHOLD = 40;

@Injectable()
export class CrmService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    @InjectModel(Opportunity.name) private opportunityModel: Model<Opportunity>,
    @InjectModel(Suggestion.name) private suggestionModel: Model<Suggestion>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  private actor(user: any) {
    return {
      id: String(user._id || user.id),
      role: user.role as string,
      territory: user.territory as string | undefined,
    };
  }

  private canSeeLead(user: any, lead: Lead): boolean {
    const { id, role } = this.actor(user);
    if (role === 'admin' || role === 'broker') return true;
    if (role === 'user') return lead.buyerUserId === id || lead.email === user.email;
    if (role === 'agent') {
      return lead.ownerUserId === id || isLeadInPool(lead);
    }
    return false;
  }

  async listLeads(user: any, query: { bucket?: string; status?: string }) {
    const { id, role } = this.actor(user);
    const filter: any = {};
    if (query.status && query.status !== 'all') filter.status = query.status;

    if (role === 'user') {
      filter.$or = [{ buyerUserId: id }, { email: user.email }];
    } else if (role === 'agent') {
      if (query.bucket === 'mine') filter.ownerUserId = id;
      else if (query.bucket === 'pool') filter.ownerUserId = UNASSIGNED_OWNER_ID;
      else filter.$or = [{ ownerUserId: id }, { ownerUserId: UNASSIGNED_OWNER_ID }];
    }

    const leads = await this.leadModel.find(filter).sort({ createdAt: -1 }).lean();
    const poolCount = await this.leadModel.countDocuments({
      ownerUserId: UNASSIGNED_OWNER_ID,
      status: { $nin: ['converted', 'disqualified'] },
    });
    const mineCount = await this.leadModel.countDocuments({
      ownerUserId: id,
      status: { $nin: ['converted', 'disqualified'] },
    });
    const pipelineValue = leads
      .filter((l) => l.status !== 'converted' && l.status !== 'disqualified')
      .reduce((s, l) => s + (l.estimatedAmount || 0), 0);

    return {
      leads,
      kpis: {
        poolCount,
        mineCount,
        working: leads.filter((l) => l.status === 'working' || l.status === 'qualified').length,
        pipelineValue,
      },
    };
  }

  async createLead(user: any, dto: CreateLeadDto) {
    if (!canDo(user.role, 'Lead:create')) {
      throw new ForbiddenException('Cannot create leads');
    }
    const { id, role } = this.actor(user);
    const ownerUserId = isDealerRole(role) ? id : UNASSIGNED_OWNER_ID;
    const lead = await this.leadModel.create({
      company: dto.company || '',
      firstName: dto.firstName,
      lastName: dto.lastName || '',
      email: dto.email,
      phone: dto.phone || '',
      territory: dto.territory || user.territory || 'Dubai',
      locationPreference: dto.locationPreference || dto.territory || '',
      intent: dto.intent || '',
      estimatedAmount: dto.estimatedAmount || 0,
      bedrooms: dto.bedrooms || 0,
      notes: dto.notes,
      propertyId: dto.propertyId,
      source: 'manual',
      status: isDealerRole(role) ? 'working' : 'new',
      ownerUserId,
      claimedAt: isDealerRole(role) ? new Date() : undefined,
      buyerUserId: role === 'user' ? id : undefined,
    });
    if (dto.propertyId) {
      const property = await this.propertyModel.findById(dto.propertyId);
      if (property) await this.matchLeadToInventory(lead, property);
    } else {
      await this.matchLeadToInventory(lead);
    }
    return lead;
  }

  async claimLead(user: any, leadId: string) {
    if (!canDo(user.role, 'Lead:claim')) throw new ForbiddenException();
    const lead = await this.leadModel.findById(leadId);
    if (!lead) throw new NotFoundException('Lead not found');
    if (!isLeadInPool(lead) && lead.ownerUserId !== String(user._id) && user.role !== 'admin' && user.role !== 'broker') {
      throw new ForbiddenException('Lead already claimed');
    }
    lead.ownerUserId = String(user._id);
    lead.claimedAt = new Date();
    lead.status = lead.status === 'new' ? 'working' : lead.status;
    await lead.save();
    return lead;
  }

  async transferLead(user: any, leadId: string, toUserId: string) {
    if (!canDo(user.role, 'Lead:assign') && String(user._id) !== (await this.leadModel.findById(leadId))?.ownerUserId) {
      throw new ForbiddenException();
    }
    const lead = await this.leadModel.findById(leadId);
    if (!lead) throw new NotFoundException('Lead not found');
    lead.transferredFromUserId = lead.ownerUserId;
    lead.ownerUserId = toUserId;
    lead.claimedAt = new Date();
    await lead.save();
    return lead;
  }

  async updateStatus(user: any, leadId: string, status: string) {
    const lead = await this.leadModel.findById(leadId);
    if (!lead) throw new NotFoundException('Lead not found');
    if (!this.canSeeLead(user, lead) || !isDealerRole(user.role)) {
      throw new ForbiddenException();
    }
    lead.status = status;
    lead.lastContactedAt = new Date();
    await lead.save();
    return lead;
  }

  async convertLead(user: any, leadId: string) {
    const lead = await this.leadModel.findById(leadId);
    if (!lead) throw new NotFoundException('Lead not found');
    if (isLeadInPool(lead)) {
      await this.claimLead(user, leadId);
    }
    const refreshed = await this.leadModel.findById(leadId);
    const stage = OPPORTUNITY_STAGES[1];
    const opp = await this.opportunityModel.create({
      name: `${refreshed.firstName} ${refreshed.lastName} — ${refreshed.locationPreference || refreshed.territory}`,
      leadId: String(refreshed._id),
      propertyId: refreshed.propertyId,
      stage: stage.id,
      amount: refreshed.estimatedAmount,
      probability: stage.probability,
      ownerUserId: String(user._id),
      source: refreshed.source,
      contactName: `${refreshed.firstName} ${refreshed.lastName}`.trim(),
      contactEmail: refreshed.email,
      nextStep: 'Book viewing and confirm budget',
    });
    refreshed.status = 'converted';
    refreshed.convertedOpportunityId = String(opp._id);
    refreshed.convertedAt = new Date();
    await refreshed.save();
    return { lead: refreshed, opportunity: opp };
  }

  async listOpportunities(user: any) {
    const { id, role } = this.actor(user);
    const filter: any = role === 'admin' || role === 'broker' ? {} : { ownerUserId: id };
    return this.opportunityModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async listSuggestions(user: any) {
    const { id, role } = this.actor(user);
    const filter: any = role === 'admin' || role === 'broker' ? {} : { agentId: id };
    const rows = await this.suggestionModel.find(filter).sort({ score: -1, createdAt: -1 }).lean();
    const propertyIds = [...new Set(rows.map((r) => r.propertyId))];
    const leadIds = [...new Set(rows.map((r) => r.leadId))];
    const [properties, leads] = await Promise.all([
      this.propertyModel.find({ _id: { $in: propertyIds } }).lean(),
      this.leadModel.find({ _id: { $in: leadIds } }).lean(),
    ]);
    const propertyMap = Object.fromEntries(properties.map((p: any) => [String(p._id), p]));
    const leadMap = Object.fromEntries(leads.map((l: any) => [String(l._id), l]));
    return rows.map((row) => ({
      ...row,
      property: propertyMap[row.propertyId] || null,
      lead: leadMap[row.leadId] || null,
    }));
  }

  async updateSuggestion(user: any, id: string, status: string) {
    const row = await this.suggestionModel.findById(id);
    if (!row) throw new NotFoundException('Suggestion not found');
    if (row.agentId !== String(user._id) && user.role !== 'admin' && user.role !== 'broker') {
      throw new ForbiddenException();
    }
    row.status = status;
    await row.save();
    return row;
  }

  async dashboard(user: any) {
    const { id, role } = this.actor(user);
    const listingFilter: any = role === 'admin' || role === 'broker' ? { active: true } : { agentId: id, active: true };
    const leadFilter: any =
      role === 'admin' || role === 'broker'
        ? { status: { $nin: ['converted', 'disqualified'] } }
        : {
            status: { $nin: ['converted', 'disqualified'] },
            $or: [{ ownerUserId: id }, { ownerUserId: UNASSIGNED_OWNER_ID }],
          };
    const [listings, openLeads, suggestions, opps] = await Promise.all([
      this.propertyModel.countDocuments(listingFilter),
      this.leadModel.countDocuments(leadFilter),
      this.suggestionModel.countDocuments({
        ...(role === 'admin' || role === 'broker' ? {} : { agentId: id }),
        status: 'new',
      }),
      this.opportunityModel.find(role === 'admin' || role === 'broker' ? {} : { ownerUserId: id }).lean(),
    ]);
    return {
      listings,
      openLeads,
      newSuggestions: suggestions,
      pipelineValue: opps
        .filter((o) => o.stage !== 'lost')
        .reduce((s, o) => s + (o.amount || 0), 0),
      stages: OPPORTUNITY_STAGES.map((s) => ({
        ...s,
        count: opps.filter((o) => o.stage === s.id).length,
      })),
    };
  }

  /** Called after a dealer publishes a listing. */
  async onListingCreated(property: Property & { _id?: any }, agentId: string) {
    const listing = {
      id: String((property as any)._id),
      title: property.title,
      type: property.type,
      price: property.price,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      agentId,
    };

    const leads = await this.leadModel.find({
      status: { $nin: ['converted', 'disqualified'] },
    });

    const generated: any[] = [];
    for (const lead of leads) {
      const { score, reasons } = scoreListingToLead(listing, {
        id: String(lead._id),
        intent: lead.intent,
        locationPreference: lead.locationPreference || lead.territory,
        bedrooms: lead.bedrooms,
        estimatedAmount: lead.estimatedAmount,
      });
      if (score < MATCH_THRESHOLD) continue;
      const suggestion = await this.upsertSuggestion({
        propertyId: listing.id,
        leadId: String(lead._id),
        agentId: isLeadInPool(lead) ? agentId : lead.ownerUserId,
        score,
        reasons,
        kind: 'listing_match',
      });
      generated.push(suggestion);
      if (!lead.suggestedPropertyIds.includes(listing.id)) {
        lead.suggestedPropertyIds.push(listing.id);
        await lead.save();
      }
    }

    // Always drop a demand ticket in the pool so other dealers can pick it up.
    const demand = await this.leadModel.create({
      company: '',
      firstName: 'Inbound',
      lastName: 'Demand',
      title: 'Buyer',
      email: `demand+${listing.id.slice(-6)}@propertynexus.ai`,
      phone: '',
      territory: property.location,
      locationPreference: property.location,
      intent: property.type,
      estimatedAmount: property.price,
      bedrooms: property.bedrooms,
      propertyId: listing.id,
      source: 'listing_launch',
      status: 'new',
      ownerUserId: UNASSIGNED_OWNER_ID,
      notes: `Auto-generated when "${property.title}" went live. Match nearby buyers or claim this territory ticket.`,
    });

    await this.upsertSuggestion({
      propertyId: listing.id,
      leadId: String(demand._id),
      agentId,
      score: 70,
      reasons: ['New listing launch', 'Assigned to listing dealer'],
      kind: 'listing_launch',
    });

    return { matched: generated.length, demandLeadId: String(demand._id) };
  }

  async createInquiry(propertyId: string, dto: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    notes?: string;
    budget?: number;
    buyerUserId?: string;
  }) {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new NotFoundException('Listing not found');

    const existing = await this.leadModel.findOne({
      email: dto.email,
      propertyId,
      status: { $nin: ['converted', 'disqualified'] },
    });
    if (existing) {
      await this.matchLeadToInventory(existing, property);
      return { lead: existing, created: false };
    }

    const lead = await this.leadModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName || '',
      email: dto.email,
      phone: dto.phone || '',
      territory: property.location,
      locationPreference: property.location,
      intent: property.type,
      estimatedAmount: dto.budget || property.price,
      bedrooms: property.bedrooms,
      propertyId,
      notes: dto.notes,
      source: 'inquiry',
      status: 'new',
      ownerUserId: property.agentId || UNASSIGNED_OWNER_ID,
      claimedAt: property.agentId ? new Date() : undefined,
      buyerUserId: dto.buyerUserId,
      suggestedPropertyIds: [propertyId],
    });

    await this.upsertSuggestion({
      propertyId,
      leadId: String(lead._id),
      agentId: property.agentId,
      score: 95,
      reasons: ['Direct inquiry on this listing'],
      kind: 'inquiry',
    });

    await this.matchLeadToInventory(lead, property);
    return { lead, created: true };
  }

  private async matchLeadToInventory(lead: Lead & { _id?: any }, exclude?: Property & { _id?: any }) {
    const listings = await this.propertyModel.find({ active: true, availability: 'available' });
    const excludeId = exclude ? String((exclude as any)._id) : '';
    for (const listing of listings) {
      const listingId = String((listing as any)._id);
      if (listingId === excludeId) continue;
      const { score, reasons } = scoreListingToLead(
        {
          id: listingId,
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
      if (score < MATCH_THRESHOLD) continue;
      await this.upsertSuggestion({
        propertyId: listingId,
        leadId: String(lead._id),
        agentId: listing.agentId,
        score,
        reasons,
        kind: 'auto_suggest',
      });
      if (!lead.suggestedPropertyIds?.includes(listingId)) {
        lead.suggestedPropertyIds = [...(lead.suggestedPropertyIds || []), listingId];
      }
    }
    if ((lead as any).save) await (lead as any).save();
  }

  private async upsertSuggestion(input: {
    propertyId: string;
    leadId: string;
    agentId: string;
    score: number;
    reasons: string[];
    kind: string;
  }) {
    return this.suggestionModel.findOneAndUpdate(
      { propertyId: input.propertyId, leadId: input.leadId },
      { $set: input },
      { upsert: true, new: true },
    );
  }
}
