import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrmService } from './crm.service';
import { CreateLeadDto, SuggestionStatusDto, TransferLeadDto, UpdateLeadStatusDto } from './dto/crm.dto';

@ApiTags('crm')
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('dashboard')
  @Roles('agent', 'broker', 'admin')
  @ApiOperation({ summary: 'Dealer CRM dashboard KPIs' })
  dashboard(@Request() req) {
    return this.crmService.dashboard(req.user);
  }

  @Get('leads')
  @ApiOperation({ summary: 'List leads (pool / mine / all by role)' })
  listLeads(@Request() req, @Query('bucket') bucket?: string, @Query('status') status?: string) {
    return this.crmService.listLeads(req.user, { bucket, status });
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a lead' })
  createLead(@Request() req, @Body() dto: CreateLeadDto) {
    return this.crmService.createLead(req.user, dto);
  }

  @Post('leads/:id/claim')
  @Roles('agent', 'broker', 'admin')
  @ApiOperation({ summary: 'Claim a pool lead (exclusive ticket)' })
  claim(@Request() req, @Param('id') id: string) {
    return this.crmService.claimLead(req.user, id);
  }

  @Post('leads/:id/transfer')
  @Roles('agent', 'broker', 'admin')
  @ApiOperation({ summary: 'Transfer a lead to another dealer' })
  transfer(@Request() req, @Param('id') id: string, @Body() dto: TransferLeadDto) {
    return this.crmService.transferLead(req.user, id, dto.toUserId);
  }

  @Patch('leads/:id/status')
  @Roles('agent', 'broker', 'admin')
  updateStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.crmService.updateStatus(req.user, id, dto.status);
  }

  @Post('leads/:id/convert')
  @Roles('agent', 'broker', 'admin')
  @ApiOperation({ summary: 'Convert lead into an opportunity' })
  convert(@Request() req, @Param('id') id: string) {
    return this.crmService.convertLead(req.user, id);
  }

  @Get('opportunities')
  @Roles('agent', 'broker', 'admin')
  opportunities(@Request() req) {
    return this.crmService.listOpportunities(req.user);
  }

  @Get('suggestions')
  @Roles('agent', 'broker', 'admin', 'user')
  @ApiOperation({ summary: 'Auto-suggested listing ↔ lead matches' })
  suggestions(@Request() req) {
    return this.crmService.listSuggestions(req.user);
  }

  @Patch('suggestions/:id')
  @Roles('agent', 'broker', 'admin')
  updateSuggestion(@Request() req, @Param('id') id: string, @Body() dto: SuggestionStatusDto) {
    return this.crmService.updateSuggestion(req.user, id, dto.status);
  }
}
