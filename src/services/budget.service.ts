import { api } from './api';

export interface Budget {
  id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  spent_amount?: number;
  remaining_amount?: number;
  percentage_used?: number;
  is_over_budget?: boolean;
}

export interface BudgetFormData {
  category_id: number;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
}

export const budgetService = {
  async getAll(params?: { active_only?: boolean; current_only?: boolean }) {
    const { data } = await api.get<{ budgets: Budget[] }>('/budgets', { params });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<{ budget: Budget }>(`/budgets/${id}`);
    return data;
  },

  async create(budgetData: BudgetFormData) {
    const { data } = await api.post<{ message: string; budget: Budget }>('/budgets', budgetData);
    return data;
  },

  async update(id: number, budgetData: Partial<BudgetFormData>) {
    const { data } = await api.put<{ message: string; budget: Budget }>(`/budgets/${id}`, budgetData);
    return data;
  },

  async delete(id: number) {
    const { data } = await api.delete<{ message: string }>(`/budgets/${id}`);
    return data;
  },
};