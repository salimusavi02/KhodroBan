import { writable, derived, get } from 'svelte/store';
import type { Expense, ExpensesState } from '../types';

const initialState: ExpensesState = {
  expenses: [],
  isLoading: false,
  error: null,
};

function createExpensesStore() {
  const { subscribe, set, update } = writable<ExpensesState>(initialState);

  return {
    subscribe,

    setLoading(isLoading: boolean) {
      update((state) => ({ ...state, isLoading, error: null }));
    },

    setExpenses(expenses: Expense[]) {
      update((state) => ({
        ...state,
        expenses,
        isLoading: false,
        error: null,
      }));
    },

    addExpense(expense: Expense) {
      update((state) => ({
        ...state,
        expenses: [expense, ...state.expenses],
      }));
    },

    updateExpense(id: string, data: Partial<Expense>) {
      update((state) => ({
        ...state,
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
      }));
    },

    deleteExpense(id: string) {
      update((state) => ({
        ...state,
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    },

    setError(error: string) {
      update((state) => ({ ...state, error, isLoading: false }));
    },

    getByVehicle(vehicleId: string): Expense[] {
      const state = get({ subscribe });
      return state.expenses.filter((e) => e.vehicleId === vehicleId);
    },

    getByCategory(category: string): Expense[] {
      const state = get({ subscribe });
      return state.expenses.filter((e) => e.category === category);
    },

    clear() {
      set(initialState);
    },
  };
}

export const expensesStore = createExpensesStore();

// Derived: expenses grouped by category
export const expensesByCategory = derived(expensesStore, ($store) => {
  const grouped: Record<string, Expense[]> = {};
  $store.expenses.forEach((expense) => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = [];
    }
    grouped[expense.category].push(expense);
  });
  return grouped;
});

// Derived: total expenses
export const totalExpenses = derived(expensesStore, ($store) =>
  $store.expenses.reduce((sum, e) => sum + e.amount, 0)
);

// Derived: expenses by vehicle
export const expensesByVehicle = derived(expensesStore, ($store) => {
  const grouped: Record<string, number> = {};
  $store.expenses.forEach((expense) => {
    if (!grouped[expense.vehicleId]) {
      grouped[expense.vehicleId] = 0;
    }
    grouped[expense.vehicleId] += expense.amount;
  });
  return grouped;
});
