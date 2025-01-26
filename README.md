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
