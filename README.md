# APICanvas

Repository for API Management Service

## Project Structure

├── src/
│ ├── api/ # API Gateway configurations
│ ├── lambda/ # Lambda function handlers
│ ├── models/ # Data models and schemas
│ └── utils/ # Shared utilities
├── infrastructure/ # IaC configurations
├── tests/ # Test suites
└── docs/ # Documentation

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
