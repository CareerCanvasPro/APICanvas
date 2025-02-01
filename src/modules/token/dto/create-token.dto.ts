import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  apiId: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}