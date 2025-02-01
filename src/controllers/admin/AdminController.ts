import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { AdminService } from '../../services/admin/admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  async createUser(@Body() userData: any) {
    return this.adminService.createUser(userData);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.adminService.updateUser(id, userData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('templates')
  async getTemplates() {
    return this.adminService.getTemplates();
  }

  @Post('templates')
  async createTemplate(@Body() templateData: any) {
    return this.adminService.createTemplate(templateData);
  }

  @Get('analytics/user-activity')
  async getUserActivity() {
    return this.adminService.getUserActivity();
  }

  @Get('analytics/system-performance')
  async getSystemPerformance() {
    return this.adminService.getSystemPerformance();
  }
}