import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';
import { TABLES } from '../../infrastructure/dynamodb/tables';
import { Api } from './interfaces/api.interface';
import { CreateApiDto } from './dto/create-api.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApiService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async createApi(createApiDto: CreateApiDto): Promise<Api> {
    const api: Api = {
      id: uuidv4(),
      ...createApiDto,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await this.dynamoDBService.put({
      TableName: TABLES.APIS,
      Item: api,
    });

    return api;
  }

  async getApi(id: string): Promise<Api> {
    const result = await this.dynamoDBService.get({
      TableName: TABLES.APIS,
      Key: { id },
    });

    if (!result.Item) {
      throw new NotFoundException('API not found');
    }

    return result.Item as Api;
  }

  async updateApi(id: string, updateData: Partial<Api>): Promise<Api> {
    const api = await this.getApi(id);
    const updatedApi = { ...api, ...updateData };

    await this.dynamoDBService.put({
      TableName: TABLES.APIS,
      Item: updatedApi,
    });

    return updatedApi;
  }

  async deleteApi(id: string): Promise<void> {
    await this.dynamoDBService.delete({
      TableName: TABLES.APIS,
      Key: { id },
    });
  }
}