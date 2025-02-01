import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';

@Module({
  controllers: [ApiController],
  providers: [ApiService, DynamoDBService],
  exports: [ApiService]
})
export class ApiModule {}