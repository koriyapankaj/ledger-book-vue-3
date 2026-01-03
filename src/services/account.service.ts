import { api } from './api';

export interface Account {
  id: number;
  name: string;
  type: 'asset' | 'liability';
  subtype: 'cash' | 'bank_account' | 'digital_wallet' | 'credit_card' | 'loan';
  balance: number;
  credit_limit?: number;
  available_credit?: number;
  account_number?: string;
  bank_name?: string;
  color: string;
  icon: string;
  is_active: boolean;
  include_in_total: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  name: string;
  type: 'asset' | 'liability';
  subtype: 'cash' | 'bank_account' | 'digital_wallet' | 'credit_card' | 'loan';
  balance?: number;
  credit_limit?: number;
  account_number?: string;
  bank_name?: string;
  color?: string;
  icon?: string;
  include_in_total?: boolean;
  notes?: string;
}

export interface AccountSummary {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  accounts_count: number;
  active_accounts_count: number;
}

export const accountService = {
  async getAll(params?: { type?: string; subtype?: string; active_only?: boolean }) {
    const { data } = await api.get<{ accounts: Account[] }>('/accounts', { params });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<{ account: Account }>(`/accounts/${id}`);
    return data;
  },

  async create(accountData: AccountFormData) {
    const { data } = await api.post<{ message: string; account: Account }>('/accounts', accountData);
    return data;
  },

  async update(id: number, accountData: Partial<AccountFormData>) {
    const { data } = await api.put<{ message: string; account: Account }>(`/accounts/${id}`, accountData);
    return data;
  },

  async delete(id: number) {
    const { data } = await api.delete<{ message: string }>(`/accounts/${id}`);
    return data;
  },

  async getSummary() {
    const { data } = await api.get<{ summary: AccountSummary }>('/accounts-summary');
    return data;
  },
};