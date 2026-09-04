import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  territory?: string;

  @IsOptional()
  @IsString()
  locationPreference?: string;

  @IsOptional()
  @IsEnum(['rent', 'sale', ''])
  intent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;
}

export class UpdateLeadStatusDto {
  @IsEnum(['new', 'working', 'nurture', 'qualified', 'converted', 'disqualified'])
  status: string;
}

export class TransferLeadDto {
  @IsString()
  toUserId: string;
}

export class SuggestionStatusDto {
  @IsEnum(['new', 'viewed', 'accepted', 'dismissed'])
  status: string;
}
