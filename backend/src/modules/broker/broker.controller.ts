import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrokerService } from './broker.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('brokers')
@Controller('brokers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BrokerController {
  constructor(private brokerService: BrokerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brokers' })
  async findAll() {
    return this.brokerService.findAll();
  }
}

