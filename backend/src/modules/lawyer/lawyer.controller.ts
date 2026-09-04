import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LawyerService } from './lawyer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('lawyers')
@Controller('lawyers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LawyerController {
  constructor(private lawyerService: LawyerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lawyers' })
  async findAll() {
    return this.lawyerService.findAll();
  }
}

