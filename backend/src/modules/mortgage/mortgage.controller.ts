import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MortgageService } from './mortgage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('mortgages')
@Controller('mortgages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MortgageController {
  constructor(private mortgageService: MortgageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all mortgage options' })
  async findAll() {
    return this.mortgageService.findAll();
  }
}

