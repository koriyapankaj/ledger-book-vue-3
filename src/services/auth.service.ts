import { api } from './api';
import type { AuthResponse, LoginCredentials, RegisterData, RegisterResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', credentials);
    return data;
  },

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('/register', userData);
    return data;
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/google', { id_token: idToken });
    return data;
  },

  async verifyEmailCode(email: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/email/verify-code', { email, code });
    return data;
  },

  async resendVerificationCode(email: string): Promise<{ message: string; already_verified?: boolean }> {
    const { data } = await api.post<{ message: string; already_verified?: boolean }>('/email/resend-code', {
      email,
    });
    return data;
  },

  async me(): Promise<{ user: User }> {
    const { data } = await api.get<{ user: User }>('/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async logoutAll(): Promise<void> {
    await api.post('/logout-all');
  },
};