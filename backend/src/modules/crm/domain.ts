/**
 * Property CRM domain — adapted from Manufacturing `crm/src/domain/types.ts`
 * (sagarparth10/Manufacturing, master). Only the sales CRM slice is kept:
 * Lead pool/claim, Opportunity pipeline, Contact. Manufacturing ERP/RMA/BOM
 * types are intentionally not imported.
 */

export const UNASSIGNED_OWNER_ID = 'unassigned';

export type LeadStatus =
  | 'new'
  | 'working'
  | 'nurture'
  | 'qualified'
  | 'converted'
  | 'disqualified';

export type OpportunityStage =
  | 'discovery'
  | 'qualified'
  | 'quoted'
  | 'negotiation'
  | 'won'
  | 'lost';

export const OPPORTUNITY_STAGES: {
  id: OpportunityStage;
  label: string;
  probability: number;
}[] = [
  { id: 'discovery', label: 'Discovery', probability: 10 },
  { id: 'qualified', label: 'Qualified', probability: 30 },
  { id: 'quoted', label: 'Quoted', probability: 55 },
  { id: 'negotiation', label: 'Negotiation', probability: 75 },
  { id: 'won', label: 'Won', probability: 100 },
  { id: 'lost', label: 'Lost', probability: 0 },
];

export function isLeadInPool(lead: {
  ownerUserId?: string;
  status?: string;
}): boolean {
  if (lead.status === 'converted' || lead.status === 'disqualified') return false;
  return !lead.ownerUserId || lead.ownerUserId === UNASSIGNED_OWNER_ID;
}

export type MatchReason = string;

export interface ListingMatchInput {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  agentId: string;
}

export interface LeadMatchInput {
  id: string;
  intent?: string;
  locationPreference?: string;
  bedrooms?: number;
  estimatedAmount?: number;
  ownerUserId?: string;
  status?: string;
}

export function scoreListingToLead(
  listing: ListingMatchInput,
  lead: LeadMatchInput,
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];
  let score = 0;

  const loc = (listing.location || '').toLowerCase();
  const pref = (lead.locationPreference || '').toLowerCase();
  if (pref && loc.includes(pref.split(',')[0].trim())) {
    score += 40;
    reasons.push(`Location fit: ${listing.location}`);
  } else if (pref && pref.split(' ').some((w) => w.length > 3 && loc.includes(w))) {
    score += 25;
    reasons.push(`Area overlap with ${lead.locationPreference}`);
  }

  if (lead.intent && listing.type === lead.intent) {
    score += 20;
    reasons.push(`Intent match (${listing.type})`);
  }

  if (typeof lead.bedrooms === 'number' && lead.bedrooms > 0) {
    const delta = Math.abs(listing.bedrooms - lead.bedrooms);
    if (delta === 0) {
      score += 20;
      reasons.push(`${listing.bedrooms} bedrooms`);
    } else if (delta === 1) {
      score += 10;
      reasons.push('Bedroom count close');
    }
  }

  if (lead.estimatedAmount && lead.estimatedAmount > 0) {
    const ratio = listing.price / lead.estimatedAmount;
    if (ratio >= 0.8 && ratio <= 1.2) {
      score += 20;
      reasons.push('Budget within 20%');
    } else if (ratio >= 0.6 && ratio <= 1.4) {
      score += 10;
      reasons.push('Budget in range');
    }
  }

  return { score, reasons };
}
