import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class DynamoDBService {
  private dynamoDB: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient();
  }

  async query(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> {
    return this.dynamoDB.query(params).promise();
  }

  async put(params: AWS.DynamoDB.DocumentClient.PutItemInput): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> {
    return this.dynamoDB.put(params).promise();
  }

  async get(params: AWS.DynamoDB.DocumentClient.GetItemInput): Promise<AWS.DynamoDB.DocumentClient.GetItemOutput> {
    return this.dynamoDB.get(params).promise();
  }

  async delete(params: AWS.DynamoDB.DocumentClient.DeleteItemInput): Promise<AWS.DynamoDB.DocumentClient.DeleteItemOutput> {
    return this.dynamoDB.delete(params).promise();
  }

  async update(params: AWS.DynamoDB.DocumentClient.UpdateItemInput): Promise<AWS.DynamoDB.DocumentClient.UpdateItemOutput> {
    return this.dynamoDB.update(params).promise();
  }

  async scan(params: AWS.DynamoDB.DocumentClient.ScanInput): Promise<AWS.DynamoDB.DocumentClient.ScanOutput> {
    return this.dynamoDB.scan(params).promise();
  }
}