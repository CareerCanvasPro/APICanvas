import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';

@Module({
  controllers: [TokenController],
  providers: [TokenService, DynamoDBService],
  exports: [TokenService]
})
export class TokenModule {}