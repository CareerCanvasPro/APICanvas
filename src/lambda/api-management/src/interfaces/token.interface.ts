export interface Token {
  id: string;
  api_id: string;
  status: 'active' | 'revoked';
  created: string;
  expires: string;
}