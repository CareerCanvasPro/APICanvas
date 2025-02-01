import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Template } from '../../entities/template.entity';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    private metricsService: MetricsService
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: 'active' } });
    const totalTemplates = await this.templateRepository.count();
    
    return {
      totalUsers,
      activeUsers,
      totalTemplates,
      systemHealth: await this.metricsService.getSystemHealth()
    };
  }

  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
    });
  }

  async createUser(userData: any) {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(id: string, userData: any) {
    await this.userRepository.update(id, userData);
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }

  async getTemplates() {
    return this.templateRepository.find();
  }

  async createTemplate(templateData: any) {
    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  async getUserActivity() {
    return this.metricsService.getUserActivityMetrics();
  }

  async getSystemPerformance() {
    return this.metricsService.getSystemPerformanceMetrics();
  }
}