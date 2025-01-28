import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateApiDto } from '../src/dto/api.dto';
import * as AWS from 'aws-sdk';

describe('API Flow (e2e)', () => {
  let app: INestApplication;
  let createdApiId: string;

  beforeAll(async () => {
    // Configure AWS SDK
    AWS.config.update({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      },
      endpoint: 'http://localhost:8000' // Local DynamoDB endpoint
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('API Registration Flow', () => {
    const createApiDto: CreateApiDto = {
      name: 'Test API',
      endpoint: 'https://api.test.com',
      method: 'GET',
      config: {
        rateLimit: 100,
        timeout: 30,
        cacheDuration: 300
      }
    };

    it('should create a new API', async () => {
      const response = await request(app.getHttpServer())
        .post('/apis')
        .send(createApiDto)
        .expect(201);

      createdApiId = response.body.id;
      expect(response.body.name).toBe(createApiDto.name);
      expect(response.body.endpoint).toBe(createApiDto.endpoint);
      expect(response.body.status).toBe('active');
    });

    it('should get the created API', async () => {
      const response = await request(app.getHttpServer())
        .get(`/apis/${createdApiId}`)
        .expect(200);

      expect(response.body.id).toBe(createdApiId);
      expect(response.body.name).toBe(createApiDto.name);
    });

    it('should list all APIs', async () => {
      const response = await request(app.getHttpServer())
        .get('/apis')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.find(api => api.id === createdApiId)).toBeDefined();
    });

    it('should update the API', async () => {
      const updateDto = {
        name: 'Updated Test API',
        config: {
          rateLimit: 200,
          timeout: 60,
          cacheDuration: 600
        }
      };

      const response = await request(app.getHttpServer())
        .patch(`/apis/${createdApiId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.config.rateLimit).toBe(updateDto.config.rateLimit);
    });

    it('should delete the API', async () => {
      await request(app.getHttpServer())
        .delete(`/apis/${createdApiId}`)
        .expect(200);

      // Verify API is deleted
      await request(app.getHttpServer())
        .get(`/apis/${createdApiId}`)
        .expect(404);
    });
  });
});