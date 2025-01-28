import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../guards/api-key.guard';

@ApiTags('tokens')
@Controller('apis/:apiId/tokens')
@ApiSecurity('x-api-key')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get all tokens for an API' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiResponse({ status: 200, description: 'List of tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'API not found' })
  findAll(@Param('apiId') apiId: string) {
    return this.tokenService.findAllByApiId(apiId);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Generate new API token' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'API not found' })
  create(@Param('apiId') apiId: string) {
    return this.tokenService.createToken(apiId);
  }

  @Delete(':tokenId')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Revoke API token' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiParam({ name: 'tokenId', description: 'Token ID to revoke' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  remove(@Param('apiId') apiId: string, @Param('tokenId') tokenId: string) {
    return this.tokenService.removeToken(apiId, tokenId);
  }
}