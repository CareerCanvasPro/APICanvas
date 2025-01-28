import { IsString, IsEnum, IsObject, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ApiConfigDto {
  @ApiProperty({ example: 100, description: 'Maximum requests per minute' })
  rateLimit: number;

  @ApiProperty({ example: 300, description: 'Cache duration in seconds' })
  cacheDuration: number;

  @ApiProperty({ example: 5000, description: 'Request timeout in milliseconds' })
  timeout: number;
}

export class CreateApiDto {
  @ApiProperty({ example: 'My API', description: 'Name of the API' })
  name: string;

  @ApiProperty({ example: 'https://api.example.com', description: 'API endpoint URL' })
  endpoint: string;

  @ApiProperty({ example: 'GET', enum: ['GET', 'POST', 'PUT', 'DELETE'] })
  method: string;

  @ApiProperty({ type: ApiConfigDto })
  config: ApiConfigDto;
}

export class UpdateApiDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  endpoint?: string;

  @ApiProperty({ required: false })
  method?: string;

  @ApiProperty({ required: false, type: ApiConfigDto })
  config?: ApiConfigDto;
}