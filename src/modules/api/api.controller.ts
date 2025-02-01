import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateApiDto, UpdateApiDto } from './dto';

@Controller('apis')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post()
  async createApi(@Body() createApiDto: CreateApiDto) {
    return this.apiService.createApi(createApiDto);
  }

  @Get(':id')
  async getApi(@Param('id') id: string) {
    return this.apiService.getApi(id);
  }

  @Put(':id')
  async updateApi(@Param('id') id: string, @Body() updateApiDto: UpdateApiDto) {
    return this.apiService.updateApi(id, updateApiDto);
  }

  @Delete(':id')
  async deleteApi(@Param('id') id: string) {
    return this.apiService.deleteApi(id);
  }
}