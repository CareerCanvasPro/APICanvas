import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { GlobalExceptionFilter } from './filters/http-exception.filter';

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn']
  });
  
  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Canvas')
    .setDescription('API Management Service for managing and monitoring APIs')
    .setVersion('1.0')
    .addTag('apis', 'API management endpoints')
    .addTag('tokens', 'API token management')
    .addTag('metrics', 'API usage metrics')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDoc);
  
  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
  });
  
  // Add validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  await app.init();
  
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: APIGatewayProxyHandler = async (event, context, callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};