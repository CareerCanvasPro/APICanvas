# API Canvas

API Management Service for CareerCanvas - Handles API registration, token management, and rate limiting.

## Features

- API Registration and Management
- Token Generation and Validation
- Rate Limiting
- Usage Metrics and Analytics
- Swagger Documentation

## Getting Started

### Prerequisites

- Node.js 18.x
- AWS Account
- DynamoDB Local (for development)

### Installation

```bash
cd src/lambda/api-management
npm install
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
