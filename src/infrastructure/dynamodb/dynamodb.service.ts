import { Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDB.DocumentClient;

  constructor(private configService: ConfigService) {
    this.client = new DynamoDB.DocumentClient({
      region: this.configService.get('CAREERCANVAS_AWS_REGION'),
    });
  }

  async get(params: DynamoDB.DocumentClient.GetItemInput) {
    return this.client.get(params).promise();
  }

  async put(params: DynamoDB.DocumentClient.PutItemInput) {
    return this.client.put(params).promise();
  }

  async query(params: DynamoDB.DocumentClient.QueryInput) {
    return this.client.query(params).promise();
  }

  async update(params: DynamoDB.DocumentClient.UpdateItemInput) {
    return this.client.update(params).promise();
  }

  async delete(params: DynamoDB.DocumentClient.DeleteItemInput) {
    return this.client.delete(params).promise();
  }
}