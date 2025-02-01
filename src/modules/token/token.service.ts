import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';
import { TABLES } from '../../infrastructure/dynamodb/tables';
import { Token } from './interfaces/token.interface';
import { CreateTokenDto } from './dto/create-token.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private generateTokenKey(): string {
    return `cc_${crypto.randomBytes(32).toString('hex')}`;
  }

  async createToken(createTokenDto: CreateTokenDto): Promise<Token> {
    const token: Token = {
      id: uuidv4(),
      key: this.generateTokenKey(),
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: createTokenDto.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      apiId: createTokenDto.apiId,
      usage: {
        calls: 0,
        lastUsed: new Date().toISOString()
      }
    };

    await this.dynamoDBService.put({
      TableName: TABLES.TOKENS,
      Item: token
    });

    return token;
  }

  async validateToken(key: string): Promise<Token> {
    const params = {
      TableName: TABLES.TOKENS,
      IndexName: 'TokenKeyIndex',
      KeyConditionExpression: '#key = :key',
      ExpressionAttributeNames: {
        '#key': 'key'
      },
      ExpressionAttributeValues: {
        ':key': key
      }
    };

    const result = await this.dynamoDBService.query(params);
    const token = result.Items?.[0] as Token;

    if (!token || token.status !== 'active' || new Date(token.expiresAt) < new Date()) {
      throw new NotFoundException('Invalid or expired token');
    }

    return token;
  }

  async updateTokenUsage(id: string): Promise<void> {
    await this.dynamoDBService.update({
      TableName: TABLES.TOKENS,
      Key: { id },
      UpdateExpression: 'SET usage.calls = usage.calls + :inc, usage.lastUsed = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': new Date().toISOString()
      }
    });
  }

  async revokeToken(id: string): Promise<void> {
    await this.dynamoDBService.update({
      TableName: TABLES.TOKENS,
      Key: { id },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'revoked'
      }
    });
  }
}