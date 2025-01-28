<<<<<<< HEAD

# APICanvas
=======
# API Canvas
>>>>>>> 05e22cceb (feat(api-management): upgrade dependencies and fix service implementations)

API Canvas is a serverless API management service built with NestJS and AWS CDK. It provides API key management, rate limiting, and usage metrics tracking capabilities.

<<<<<<< HEAD
## Project Structure
```plaintext
APICanvas/
├── src/
│   ├── lambda/
│   │   └── api-management/
│   │       ├── models/
│   │       │   └── types.ts
│   │       ├── middleware/
│   │       │   └── tokenValidator.ts
│   │       ├── utils/
│   │       │   └── dynamodb.ts
│   │       ├── index.ts
│   │       ├── package.json
│   │       └── tsconfig.json
│   └── utils/
│       └── common.ts
├── infrastructure/
│   ├── lib/
│   │   └── api-canvas-stack.ts
│   ├── bin/
│   │   └── api-canvas.ts
│   └── cdk.json
├── tests/
│   └── api-management/
│       └── api.test.ts
├── package.json
└── tsconfig.json
```
=======
## Features

- API Management
  - Create, update, and delete APIs
  - Configure rate limits, caching, and timeouts
- Token Management
  - Generate and revoke API keys
  - Token-based authentication
- Rate Limiting
  - Per-token rate limiting
  - Configurable limits
- Metrics
  - Request count tracking
  - Error rate monitoring
  - Latency tracking
  - Daily and monthly aggregations
>>>>>>> 05e22cceb (feat(api-management): upgrade dependencies and fix service implementations)

## Getting Started

<<<<<<< HEAD
1. Prerequisites
   - Node.js (v18 or later)
   - AWS CLI configured
   - AWS CDK CLI

2. Installation
=======
### Prerequisites

- Node.js 18 or later
- AWS CLI configured
- AWS CDK CLI installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/api-canvas.git
cd api-canvas
```
>>>>>>> 05e22cceb (feat(api-management): upgrade dependencies and fix service implementations)
```bash
npm install
```

3. Deploy Infrastructure
```bash
npm run deploy
```

<<<<<<< HEAD
4. Development
To start the development server:
=======
4. Run development server

>>>>>>> 05e22cceb (feat(api-management): upgrade dependencies and fix service implementations)
```bash
npm run dev
```

<<<<<<< HEAD
## API Documentation

### API Management Endpoints

#### Create API
- **POST** `/apis`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
    "name": "API Name",
    "endpoint": "/path",
    "method": "GET",
    "config": {
        "rateLimit": 100,
        "cacheDuration": 300,
        "timeout": 15000
    }
}
```

#### List APIs
- **GET** `/apis`
- **Headers:** `x-api-key: <your-api-key>`

#### Update API
- **PUT** `/apis/{id}`
- **Headers:** 
  - `Content-Type: application/json`
  - `x-api-key: <your-api-key>`

#### Delete API
- **DELETE** `/apis/{id}`
- **Headers:** `x-api-key: <your-api-key>`

### Token Management Endpoints

#### Create Token
- **POST** `/apis/{id}/tokens`
- **Headers:** `Content-Type: application/json`

#### List Tokens
- **GET** `/apis/{id}/tokens`
- **Headers:** `x-api-key: <your-api-key>`

#### Revoke Token
- **DELETE** `/apis/{id}/tokens/{tokenId}`
- **Headers:** `x-api-key: <your-api-key>`

## Development

### Building the Project
```bash
npm run build
```

### Running Tests
```bash
npm test
```

### Deployment
```bash
npm run deploy
```

## Security

- API key validation for protected endpoints
- Token-based authentication
- Request validation
- CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

=======
## Tech Stack

### Backend

- AWS Lambda (Node.js 18.x)
- Amazon API Gateway
- Amazon DynamoDB
- AWS CDK (Infrastructure as Code)

### Development

- TypeScript (^5.0.0)
- Node.js (v18.x)
- AWS SDK for JavaScript/TypeScript
- AWS Lambda Runtime
- Jest (Testing)

### Tools & Infrastructure

- AWS CDK CLI
- AWS CLI
- Postman (API Testing)
- Git (Version Control)
>>>>>>> 05e22cceb (feat(api-management): upgrade dependencies and fix service implementations)
