import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DynamoDBService } from '../utils/dynamodb.service';
import { Token } from '../interfaces/token.interface';
import { ApiService } from './api.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly apiService: ApiService
  ) {}

  private readonly tableName = process.env.TOKENS_TABLE || 'tokens';

  async findAllByApiId(apiId: string): Promise<Token[]> {
    const result = await this.dynamoDBService.query({
      TableName: this.tableName,
      IndexName: 'api_id-index',
      KeyConditionExpression: 'api_id = :apiId',
      ExpressionAttributeValues: {
        ':apiId': apiId
      }
    });
    return result.Items as Token[];
  }

  async createToken(apiId: string): Promise<Token> {
    await this.apiService.findOne(apiId); // Verify API exists

    const token: Token = {
      id: uuidv4(),
      api_id: apiId,
      status: 'active',
      created: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };

    await this.dynamoDBService.put({
      TableName: this.tableName,
      Item: token
    });

    return token;
  }

  async validateToken(tokenId: string): Promise<boolean> {
    const result = await this.dynamoDBService.get({
      TableName: this.tableName,
      Key: { id: tokenId }
    });

    if (!result.Item) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = result.Item as Token;
    if (token.status !== 'active' || new Date(token.expires) < new Date()) {
      throw new UnauthorizedException('Token expired or inactive');
    }

    return true;
  }

  async removeToken(apiId: string, tokenId: string): Promise<void> {
    const token = await this.getToken(tokenId);
    if (token.api_id !== apiId) {
      throw new UnauthorizedException('Token does not belong to this API');
    }

    await this.dynamoDBService.delete({
      TableName: this.tableName,
      Key: { id: tokenId }
    });
  }

  async getToken(tokenId: string): Promise<Token> {
    const result = await this.dynamoDBService.get({
      TableName: this.tableName,
      Key: { id: tokenId }
    });

    if (!result.Item) {
      throw new NotFoundException('Token not found');
    }

    return result.Item as Token;
  }
}