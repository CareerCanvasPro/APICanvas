import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

export const dynamoDBService = {
  async put(params: DynamoDB.DocumentClient.PutItemInput) {
    return dynamodb.put(params).promise();
  },

  async get(params: DynamoDB.DocumentClient.GetItemInput) {
    return dynamodb.get(params).promise();
  },

  async scan(params: DynamoDB.DocumentClient.ScanInput) {
    return dynamodb.scan(params).promise();
  },

  async delete(params: DynamoDB.DocumentClient.DeleteItemInput) {
    return dynamodb.delete(params).promise();
  }
};