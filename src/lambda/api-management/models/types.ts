export interface APIEntity {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: 'active' | 'inactive';
  created_at: string;
  config: {
    rateLimit: number;
    cacheDuration: number;
    timeout: number;
  };
}

export interface TokenEntity {
  id: string;
  api_id: string;
  status: 'active' | 'revoked';
  created: string;
  expires: string;
}