import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MetricsQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  api_id?: string;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class MetricsResponseDto {
  api_id: string;
  period: string;
  total_requests: number;
  error_rate: number;
  avg_latency: number;
  rate_limit_violations: number;
}