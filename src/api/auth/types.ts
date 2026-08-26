export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  invitation_token: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: string;
  organization_id: string;
  email: string;
  is_active: boolean;
}
