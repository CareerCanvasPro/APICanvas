import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  security: {
    adminKey: process.env.CAREERCANVAS_ADMIN_KEY,
    defaultRateLimit: parseInt(process.env.DEFAULT_RATE_LIMIT || '100', 10),
    tokenExpiration: parseInt(process.env.TOKEN_EXPIRATION_DAYS || '30', 10),
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  },
}));