import { api } from './api';

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
  balance_status: 'owes_you' | 'you_owe' | 'settled';
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface ContactSummary {
  total_owed_to_you: number;
  total_you_owe: number;
  net_position: number;
  contacts_count: number;
  settled_count: number;
}

export const contactService = {
  async getAll(params?: { status?: string; active_only?: boolean; search?: string }) {
    const { data } = await api.get<{ contacts: Contact[] }>('/contacts', { params });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<{ contact: Contact }>(`/contacts/${id}`);
    return data;
  },

  async create(contactData: ContactFormData) {
    const { data } = await api.post<{ message: string; contact: Contact }>('/contacts', contactData);
    return data;
  },

  async update(id: number, contactData: Partial<ContactFormData>) {
    const { data } = await api.put<{ message: string; contact: Contact }>(`/contacts/${id}`, contactData);
    return data;
  },

  async delete(id: number) {
    const { data } = await api.delete<{ message: string }>(`/contacts/${id}`);
    return data;
  },

  async getSummary() {
    const { data } = await api.get<{ summary: ContactSummary }>('/contacts-summary');
    return data;
  },
};