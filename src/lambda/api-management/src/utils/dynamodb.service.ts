import { Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDB.DocumentClient;

  constructor() {
    this.client = new DynamoDB.DocumentClient();
  }

  async query(params: DynamoDB.DocumentClient.QueryInput): Promise<DynamoDB.DocumentClient.QueryOutput> {
    return this.client.query(params).promise();
  }

  async get(params: DynamoDB.DocumentClient.GetItemInput): Promise<DynamoDB.DocumentClient.GetItemOutput> {
    return this.client.get(params).promise();
  }

  async put(params: DynamoDB.DocumentClient.PutItemInput): Promise<DynamoDB.DocumentClient.PutItemOutput> {
    return this.client.put(params).promise();
  }

  async update(params: DynamoDB.DocumentClient.UpdateItemInput): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
    return this.client.update(params).promise();
  }

  async delete(params: DynamoDB.DocumentClient.DeleteItemInput): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {
    return this.client.delete(params).promise();
  }

  async scan(params: DynamoDB.DocumentClient.ScanInput): Promise<DynamoDB.DocumentClient.ScanOutput> {
    return this.client.scan(params).promise();
  }
}