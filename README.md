
# APICanvas

Repository for API Management Service

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

## Setup Instructions

1. Prerequisites
   - Node.js (v18 or later)
   - AWS CLI configured
   - AWS CDK CLI

2. Installation
```bash
npm install
```

3. Deploy Infrastructure
```bash
npm run deploy
```

4. Development
To start the development server:
```bash
npm run dev
```

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

