import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from '../property/schemas/property.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { Opportunity, OpportunitySchema } from './schemas/opportunity.schema';
import { Suggestion, SuggestionSchema } from './schemas/suggestion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Opportunity.name, schema: OpportunitySchema },
      { name: Suggestion.name, schema: SuggestionSchema },
      { name: Property.name, schema: PropertySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
