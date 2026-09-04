import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agent/schemas/agent.schema';
import { Lead, LeadSchema } from '../crm/schemas/lead.schema';
import { Suggestion, SuggestionSchema } from '../crm/schemas/suggestion.schema';
import { Property, PropertySchema } from '../property/schemas/property.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Suggestion.name, schema: SuggestionSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
