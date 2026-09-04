import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  territory?: string;

  @IsOptional()
  @IsEnum(['user', 'agent', 'broker'])
  role?: 'user' | 'agent' | 'broker';
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
