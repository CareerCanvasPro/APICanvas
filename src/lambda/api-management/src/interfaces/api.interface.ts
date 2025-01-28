export interface ApiConfig {
  rateLimit: number;
  cacheDuration: number;
  timeout: number;
}

export interface Api {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: string;
  created_at: string;
  updated_at: string;
  config: {
    rateLimit: number;
  };
}