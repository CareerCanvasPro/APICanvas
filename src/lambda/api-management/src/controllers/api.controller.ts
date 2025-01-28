import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiService } from '../services/api.service';
import { CreateApiDto, UpdateApiDto } from '../dto/api.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('apis')
@Controller('apis')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  @ApiOperation({ summary: 'Get all APIs' })
  @ApiResponse({ status: 200, description: 'List of all APIs' })
  findAll() {
    return this.apiService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API by ID' })
  @ApiParam({ name: 'id', description: 'API ID' })
  @ApiResponse({ status: 200, description: 'API details' })
  @ApiResponse({ status: 404, description: 'API not found' })
  findOne(@Param('id') id: string) {
    return this.apiService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new API' })
  @ApiResponse({ status: 201, description: 'API created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createApiDto: CreateApiDto) {
    return this.apiService.create(createApiDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API' })
  @ApiParam({ name: 'id', description: 'API ID' })
  @ApiResponse({ status: 200, description: 'API updated successfully' })
  @ApiResponse({ status: 404, description: 'API not found' })
  update(@Param('id') id: string, @Body() updateApiDto: UpdateApiDto) {
    return this.apiService.update(id, updateApiDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API' })
  @ApiParam({ name: 'id', description: 'API ID' })
  @ApiResponse({ status: 200, description: 'API deleted successfully' })
  @ApiResponse({ status: 404, description: 'API not found' })
  remove(@Param('id') id: string) {
    return this.apiService.remove(id);
  }
}