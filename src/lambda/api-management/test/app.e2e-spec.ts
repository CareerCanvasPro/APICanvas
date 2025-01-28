import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateApiDto, UpdateApiDto } from '../src/dto/api.dto';

describe('API Management (e2e)', () => {
  let app: INestApplication;
  let apiId: string;
  let apiKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }));
    await app.init();
  });

  describe('API Management', () => {
    describe('/apis (GET)', () => {
      it('should return empty array initially', () => {
        return request(app.getHttpServer())
          .get('/apis')
          .expect(200)
          .expect([]);
      });
    });

    describe('/apis (POST)', () => {
      it('should reject invalid API creation request', () => {
        return request(app.getHttpServer())
          .post('/apis')
          .send({
            name: 'Invalid API'
            // Missing required fields
          })
          .expect(400);
      });

      it('should create a new API', () => {
        const createApiDto: CreateApiDto = {
          name: 'Test API',
          endpoint: 'https://api.test.com',
          method: 'GET',
          config: {
            rateLimit: 100,
            cacheDuration: 300,
            timeout: 5000
          }
        };

        return request(app.getHttpServer())
          .post('/apis')
          .send(createApiDto)
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(createApiDto.name);
            apiId = res.body.id;
          });
      });
    });

    describe('/apis/:id (PUT)', () => {
      it('should update existing API', () => {
        const updateApiDto: UpdateApiDto = {
          name: 'Updated API Name',
          config: {
            rateLimit: 200,
            cacheDuration: 600,
            timeout: 10000
          }
        };

        return request(app.getHttpServer())
          .put(`/apis/${apiId}`)
          .send(updateApiDto)
          .expect(200)
          .expect(res => {
            expect(res.body.name).toBe(updateApiDto.name);
            expect(res.body.config.rateLimit).toBe(updateApiDto.config.rateLimit);
          });
      });

      it('should return 404 for non-existent API', () => {
        return request(app.getHttpServer())
          .put('/apis/non-existent-id')
          .send({ name: 'Test' })
          .expect(404);
      });
    });
  });

  describe('Token Management', () => {
    describe('/apis/:id/tokens (POST)', () => {
      it('should generate an API key', () => {
        return request(app.getHttpServer())
          .post(`/apis/${apiId}/tokens`)
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('expires');
            apiKey = res.body.id;
          });
      });

      it('should return 404 for non-existent API', () => {
        return request(app.getHttpServer())
          .post('/apis/non-existent-id/tokens')
          .expect(404);
      });
    });

    describe('/apis/:id/tokens/:tokenId (DELETE)', () => {
      it('should revoke an API key', () => {
        return request(app.getHttpServer())
          .delete(`/apis/${apiId}/tokens/${apiKey}`)
          .expect(200);
      });
    });
  });

  describe('Metrics', () => {
    beforeAll(async () => {
      // Generate new token for metrics tests
      const response = await request(app.getHttpServer())
        .post(`/apis/${apiId}/tokens`)
        .expect(201);
      apiKey = response.body.id;
    });

    describe('/apis/:id/metrics/daily (GET)', () => {
      it('should return daily metrics with valid API key', () => {
        return request(app.getHttpServer())
          .get(`/apis/${apiId}/metrics/daily`)
          .set('x-api-key', apiKey)
          .query({ start_date: '2024-01-01' })
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBeTruthy();
          });
      });
    });

    describe('/apis/:id/metrics/monthly (GET)', () => {
      it('should return monthly metrics with valid API key', () => {
        return request(app.getHttpServer())
          .get(`/apis/${apiId}/metrics/monthly`)
          .set('x-api-key', apiKey)
          .query({ start_date: '2024-01-01' })
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBeTruthy();
          });
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});