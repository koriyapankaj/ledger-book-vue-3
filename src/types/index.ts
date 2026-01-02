export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  financial_summary: {
    total_assets: number;
    total_liabilities: number;
    net_worth: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  currency?: string;
  timezone?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}