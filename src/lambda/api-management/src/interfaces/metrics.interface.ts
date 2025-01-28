export interface ApiMetrics {
  api_id: string;
  timestamp: string;
  requests: number;
  errors: number;
  latency: number;
  rate_limit_hits: number;
}