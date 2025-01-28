import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  api_id: string;

  @IsOptional()
  @IsDateString()
  expires?: string;
}

export class TokenResponseDto {
  id: string;
  api_id: string;
  status: string;
  created: string;
  expires: string;
}