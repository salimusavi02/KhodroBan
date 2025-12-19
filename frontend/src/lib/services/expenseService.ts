import api from './api';
import type { Expense, ExpenseFormData, ApiResponse } from '../types';

// Mock data
const mockExpenses: Expense[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '1403/09/18',
    amount: 350000,
    category: 'fuel',
    km: 84500,
    note: 'بنزین سوپر',
    createdAt: '2024-12-08',
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    vehicleId: '1',
    date: '1403/09/10',
    amount: 80000,
    category: 'wash',
    note: 'کارواش کامل',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  {
    id: '3',
    vehicleId: '1',
    date: '1403/09/05',
    amount: 25000,
    category: 'parking',
    createdAt: '2024-11-25',
    updatedAt: '2024-11-25',
  },
  {
    id: '4',
    vehicleId: '2',
    date: '1403/09/12',
    amount: 420000,
    category: 'fuel',
    km: 141500,
    createdAt: '2024-12-02',
    updatedAt: '2024-12-02',
  },
  {
    id: '5',
    vehicleId: '1',
    date: '1403/08/28',
    amount: 150000,
    category: 'toll',
    note: 'عوارض آزادراه',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-18',
  },
];

const USE_MOCK = true;

export const expenseService = {
  /**
   * Get all expenses (optionally filtered by vehicle)
   */
  async getAll(vehicleId?: string): Promise<Expense[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (vehicleId) {
        return mockExpenses.filter(e => e.vehicleId === vehicleId);
      }
      return mockExpenses;
    }

    const params = vehicleId ? { vehicle_id: vehicleId } : {};
    const response = await api.get<ApiResponse<Expense[]>>('/expenses/', { params });
    return response.data.data;
  },

  /**
   * Get an expense by ID
   */
  async getById(id: string): Promise<Expense> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const expense = mockExpenses.find(e => e.id === id);
      if (!expense) throw new Error('هزینه یافت نشد');
      return expense;
    }

    const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}/`);
    return response.data.data;
  },

  /**
   * Create a new expense
   */
  async create(data: ExpenseFormData): Promise<Expense> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockExpenses.unshift(newExpense);
      return newExpense;
    }

    const response = await api.post<ApiResponse<Expense>>('/expenses/', data);
    return response.data.data;
  },

  /**
   * Update an expense
   */
  async update(id: string, data: Partial<ExpenseFormData>): Promise<Expense> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) throw new Error('هزینه یافت نشد');
      
      mockExpenses[index] = {
        ...mockExpenses[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockExpenses[index];
    }

    const response = await api.patch<ApiResponse<Expense>>(`/expenses/${id}/`, data);
    return response.data.data;
  },

  /**
   * Delete an expense
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index !== -1) {
        mockExpenses.splice(index, 1);
      }
      return;
    }

    await api.delete(`/expenses/${id}/`);
  },

  /**
   * Get expenses by category
   */
  async getByCategory(category: string): Promise<Expense[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockExpenses.filter(e => e.category === category);
    }

    const response = await api.get<ApiResponse<Expense[]>>('/expenses/', {
      params: { category },
    });
    return response.data.data;
  },
};
