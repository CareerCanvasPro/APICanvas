# API Management Service

A serverless NestJS application that handles API registration, token management, and rate limiting for CareerCanvas.

## System Architecture

### API Gateway Layer
- **Base URL**: `/apis`
- **Endpoints**:
  - API Registry (`/apis`)
    - `GET /` - List all APIs
    - `POST /` - Register new API
    - `PUT /{id}` - Update API
    - `DELETE /{id}` - Remove API
  - Token Management (`/apis/{id}/tokens`)
    - `GET /` - List tokens
    - `POST /` - Generate token
    - `DELETE /{tokenId}` - Revoke token
  - Metrics (`/apis/{id}/metrics`)
    - `GET /` - Get API usage metrics
    - `GET /daily` - Daily statistics
    - `GET /monthly` - Monthly statistics

### Lambda Functions
1. **API Management Service**
   - Handles API registration and configuration
   - Validates API endpoints
   - Manages API lifecycle

2. **Token Service**
   - Generates secure API tokens
   - Validates token requests
   - Implements rate limiting
   - Manages token lifecycle

3. **Metrics Collector**
   - Records API usage statistics
   - Tracks rate limit violations
   - Generates usage reports

### Data Storage
1. **DynamoDB Tables**
   - `apis-table`
     - Primary Key: `id` (String)
     - Attributes: name, endpoint, method, config
   - `tokens-table`
     - Primary Key: `id` (String)
     - Attributes: api_id, status, expires
   - `rate-limit-table`
     - Partition Key: `token` (String)
     - Sort Key: `api_id` (String)
     - TTL: `ttl` attribute

2. **CloudWatch Metrics**
   - API invocation counts
   - Rate limit violations
   - Response times
   - Error rates

### Admin Dashboard
React-based frontend application for:
- API Management
  - Create/Edit API configurations
  - View API status and metrics
- Token Management
  - Generate/revoke tokens
  - Set rate limits
- Metrics Visualization
  - Usage graphs
  - Performance metrics
  - Error tracking

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Deploy to AWS
npm run deploy