import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DynamoDBService } from '../utils/dynamodb.service';
import { ApiService } from './api.service';
import { Api } from '../interfaces/api.interface';

@Injectable()
export class RateLimitService {
  private readonly tableName = process.env.RATE_LIMIT_TABLE || 'rate_limits';

  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly apiService: ApiService
  ) {}

  async getApiDetails(apiId: string): Promise<Api> {
    return this.apiService.findOne(apiId);
  }

  async checkRateLimit(token: string, api: Api): Promise<boolean> {
    const now = Date.now();
    const ttl = Math.floor(now / 1000) + 3600; // 1 hour from now

    const result = await this.dynamoDBService.query({
      TableName: this.tableName,
      KeyConditionExpression: 'token = :token AND api_id = :apiId',
      ExpressionAttributeValues: {
        ':token': token,
        ':apiId': api.id
      }
    });

    if (result.Count >= api.config.rateLimit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.dynamoDBService.put({
      TableName: this.tableName,
      Item: {
        token,
        api_id: api.id,
        timestamp: now,
        ttl
      }
    });

    return true;
  }
}