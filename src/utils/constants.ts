import { config } from '@/config/env.config';

export const API_BASE_URL = config.apiBaseUrl;

export const TOKEN_KEY = 'ledger_book_token';
export const USER_KEY = 'ledger_book_user';
export const THEME_KEY = 'ledger_book_theme';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  CONTACTS: '/contacts',
} as const;