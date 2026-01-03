import { api } from './api';

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  parent_id?: number;
  color: string;
  icon: string;
  is_active: boolean;
  order: number;
  description?: string;
  has_children: boolean;
  children?: Category[];
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  parent_id?: number;
  color?: string;
  icon?: string;
  order?: number;
  description?: string;
}

export const categoryService = {
  async getAll(params?: { type?: string; parent_only?: boolean; active_only?: boolean }) {
    const { data } = await api.get<{ categories: Category[] }>('/categories', { params });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<{ category: Category }>(`/categories/${id}`);
    return data;
  },

  async create(categoryData: CategoryFormData) {
    const { data } = await api.post<{ message: string; category: Category }>('/categories', categoryData);
    return data;
  },

  async update(id: number, categoryData: Partial<CategoryFormData>) {
    const { data } = await api.put<{ message: string; category: Category }>(`/categories/${id}`, categoryData);
    return data;
  },

  async delete(id: number) {
    const { data } = await api.delete<{ message: string }>(`/categories/${id}`);
    return data;
  },
};