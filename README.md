# API Canvas

API Management Service for CareerCanvas - Handles API registration, token management, and rate limiting.

## Features

- API Registration and Management
- Token Generation and Validation
- Rate Limiting and Throttling
- Usage Metrics and Analytics
- Admin Dashboard and Authentication
- Real-time Performance Monitoring
- Incident Management System
- Cache Management and Analysis
- Root Cause Analysis
- Automated Actions and Scaling
- JWT-based Authentication
- Swagger Documentation

## Getting Started

### Prerequisites

- Node.js 18.x
- AWS Account and CLI configured
- DynamoDB Local (for development)

### Installation

```bash
cd src/lambda/api-management
npm install
cp .env.example .env
```

### Development

```bash
# Start local development server
npm run start:dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

### Deployment

```bash
npm run deploy
```

## API Documentation

Once the service is running, access the Swagger documentation at:

- Local: http://localhost:3000/api
- Production: https://api.careercanvas.pro/api
