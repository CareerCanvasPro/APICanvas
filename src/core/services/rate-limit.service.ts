import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';
import { TABLES } from '../../infrastructure/dynamodb/tables';

@Injectable()
export class RateLimitService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async checkRateLimit(apiId: string, tokenId: string): Promise<boolean> {
    const now = Date.now();
    const windowSize = 60000; // 1 minute window

    const params = {
      TableName: TABLES.RATE_LIMITS,
      Key: {
        tokenId,
        apiId,
      },
      UpdateExpression: 'SET requests = if_not_exists(requests, :zero) + :inc, windowStart = if_not_exists(windowStart, :now)',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0,
        ':now': now,
        ':windowSize': windowSize,
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await this.dynamoDBService.update(params);
    const item = result.Attributes;

    if (now - item.windowStart > windowSize) {
      await this.resetRateLimit(apiId, tokenId);
      return true;
    }

    return item.requests <= 100; // Default rate limit
  }

  private async resetRateLimit(apiId: string, tokenId: string): Promise<void> {
    await this.dynamoDBService.update({
      TableName: TABLES.RATE_LIMITS,
      Key: {
        tokenId,
        apiId,
      },
      UpdateExpression: 'SET requests = :zero, windowStart = :now',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':now': Date.now(),
      },
    });
  }
}