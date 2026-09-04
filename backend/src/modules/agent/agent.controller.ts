import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agents' })
  async findAll() {
    return this.agentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get(':id/listings')
  @ApiOperation({ summary: 'Get agent listings' })
  async getListings(@Param('id') id: string) {
    return this.agentService.getListings(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get agent analytics' })
  async getAnalytics(@Param('id') id: string) {
    return this.agentService.getAnalytics(id);
  }
}

