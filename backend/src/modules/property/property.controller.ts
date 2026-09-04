import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrmService } from '../crm/crm.service';
import { CreatePropertyDto, InquireDto } from './dto/property.dto';
import { PropertyService } from './property.service';

class SearchDto {
  @IsString()
  query: string;
}

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly crmService: CrmService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  async findAll(@Query() query: any) {
    return this.propertyService.findAll(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'broker', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listings owned by the current dealer' })
  async mine(@Request() req) {
    return this.propertyService.findByAgent(String(req.user._id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertyService.findOne(id);
    if (!property) throw new NotFoundException('Listing not found');
    return property;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'broker', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create property listing (dealer) and run lead matching' })
  async create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto, req.user);
  }

  @Post('search')
  @ApiOperation({ summary: 'Advanced search with natural language' })
  async search(@Body() searchDto: SearchDto) {
    return this.propertyService.naturalLanguageSearch(searchDto.query);
  }

  @Post(':id/inquire')
  @ApiOperation({ summary: 'End-user inquiry → CRM lead + auto-suggest' })
  async inquire(@Param('id') id: string, @Body() dto: InquireDto, @Request() req) {
    return this.crmService.createInquiry(id, {
      ...dto,
      buyerUserId: req.user ? String(req.user._id) : undefined,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'broker', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property listing' })
  async update(@Param('id') id: string, @Body() updatePropertyDto: CreatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'broker', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property listing' })
  async remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
