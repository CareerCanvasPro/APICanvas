export interface Api {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: 'active' | 'inactive';
  createdAt: string;
  config: {
    rateLimit: number;
    cacheDuration: number;
    timeout: number;
  };
}