import { IsString, IsEnum, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ApiConfig {
  @IsNumber()
  rateLimit: number;

  @IsNumber()
  cacheDuration: number;

  @IsNumber()
  timeout: number;
}

export class CreateApiDto {
  @IsString()
  name: string;

  @IsString()
  endpoint: string;

  @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  method: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ApiConfig)
  config: ApiConfig;
}