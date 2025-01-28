import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../utils/dynamodb.service';
import { CreateApiDto, UpdateApiDto } from '../dto/api.dto';
import { Api } from '../interfaces/api.interface';
import { v4 as uuidv4 } from 'uuid';
import { v4 } from 'uuid';  // Add this import

@Injectable()
export class ApiService {
  private readonly tableName = process.env.APIS_TABLE || 'apis';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async findAll(): Promise<Api[]> {
    const result = await this.dynamoDBService.scan({
      TableName: this.tableName
    });
    return result.Items as Api[];
  }

  async findOne(id: string): Promise<Api> {
    const result = await this.dynamoDBService.get({
      TableName: this.tableName,
      Key: { id }
    });
    return result.Item as Api;
  }

  async create(createApiDto: CreateApiDto): Promise<Api> {
    const now = new Date().toISOString();
    const api: Api = {
      id: v4(),
      status: 'active',
      created_at: now,
      updated_at: now,  // Add this line
      ...createApiDto
    };

    await this.dynamoDBService.put({
      TableName: this.tableName,
      Item: api
    });

    return api;
  }

  async update(id: string, updateApiDto: UpdateApiDto): Promise<Api> {
    const api = await this.findOne(id);
    
    const updatedApi: Api = {
      ...api,
      ...updateApiDto,
      updated_at: new Date().toISOString()
    };

    await this.dynamoDBService.put({
      TableName: this.tableName,
      Item: updatedApi
    });

    return updatedApi;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verify existence

    await this.dynamoDBService.delete({
      TableName: this.tableName,
      Key: { id }
    });
  }
}