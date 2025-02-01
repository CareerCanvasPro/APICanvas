import { DynamoDB } from 'aws-sdk';
import { OpenAI } from 'langchain/llms/openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export const testConfig = {
  dynamoDb: new DynamoDB.DocumentClient({
    endpoint: 'http://localhost:8000',
    region: 'local'
  }),
  llm: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1
  })
};