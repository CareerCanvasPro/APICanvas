export interface Token {
  id: string;
  apiId: string;
  key: string;
  status: 'active' | 'revoked';
  createdAt: string;
  expiresAt: string;
  usage: {
    calls: number;
    lastUsed: string;
  };
}