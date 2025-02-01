import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async createToken(@Body() createTokenDto: CreateTokenDto) {
    return this.tokenService.createToken(createTokenDto);
  }

  @Get(':id')
  async getToken(@Param('id') id: string) {
    return this.tokenService.getToken(id);
  }

  @Delete(':id')
  async revokeToken(@Param('id') id: string) {
    return this.tokenService.revokeToken(id);
  }
}