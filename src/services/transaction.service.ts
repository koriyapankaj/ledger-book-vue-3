import { api } from './api';

export interface Transaction {
  id: number;
  type: 'income' | 'expense' | 'transfer' | 'lent' | 'borrowed' | 'repayment_in' | 'repayment_out';
  amount: number;
  account: {
    id: number;
    name: string;
  };
  to_account?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  contact?: {
    id: number;
    name: string;
  };
  transaction_date: string;
  title?: string;
  description?: string;
  reference_number?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  type: Transaction['type'];
  amount: number;
  account_id: number;
  to_account_id?: number;
  category_id?: number;
  contact_id?: number;
  transaction_date: string;
  title?: string;
  description?: string;
  reference_number?: string;
  metadata?: any;
}

export interface TransactionStatistics {
  total_income: number;
  total_expense: number;
  net_savings: number;
  total_transfers: number;
  period: string;
}

export const transactionService = {
  async getAll(params?: any) {
    const { data } = await api.get<{ transactions: Transaction[]; meta: any }>('/transactions', { params });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<{ transaction: Transaction }>(`/transactions/${id}`);
    return data;
  },

  async create(transactionData: TransactionFormData) {
    const { data } = await api.post<{ message: string; transaction: Transaction }>('/transactions', transactionData);
    return data;
  },

  async update(id: number, transactionData: Partial<TransactionFormData>) {
    const { data } = await api.put<{ message: string; transaction: Transaction }>(`/transactions/${id}`, transactionData);
    return data;
  },

  async delete(id: number) {
    const { data } = await api.delete<{ message: string }>(`/transactions/${id}`);
    return data;
  },

  async getStatistics(period: string = 'month') {
    const { data } = await api.get<{ statistics: TransactionStatistics }>('/transactions-statistics', {
      params: { period },
    });
    return data;
  },

  async getSpendingByCategory(period: string = 'month') {
    const { data } = await api.get<{ spending_by_category: any[] }>('/transactions-spending-by-category', {
      params: { period },
    });
    return data;
  },
};