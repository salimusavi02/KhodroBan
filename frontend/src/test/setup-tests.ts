// src/test/setup-tests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Animations API برای jsdom (مورد نیاز برای Svelte transitions)
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    updatePlaybackRate: vi.fn(),
  })) as any;
}

// Mock SvelteKit stores
vi.mock('$app/stores', () => {
  return {
    page: {
      subscribe: (fn: (value: any) => void) => {
        fn({
          url: new URL('http://localhost:5173'),
          params: {},
          route: { id: null },
          status: 200,
          error: null,
          data: {},
          form: null,
        });
        return () => {};
      },
    },
    navigating: {
      subscribe: (fn: (value: any) => void) => {
        fn(null);
        return () => {};
      },
    },
    updated: {
      subscribe: (fn: (value: any) => void) => {
        fn(false);
        return () => {};
      },
      check: vi.fn(),
    },
  };
});

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => {
  return {
    goto: vi.fn(),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    preloadData: vi.fn(),
    preloadCode: vi.fn(),
    beforeNavigate: vi.fn(),
    afterNavigate: vi.fn(),
    disableScrollHandling: vi.fn(),
  };
});

// Mock i18n
vi.mock('$lib/i18n', () => {
  return {
    setLocale: vi.fn(),
    initializeI18n: vi.fn(),
    initializeLocale: vi.fn(() => 'fa'),
    updateDocumentAttributes: vi.fn(),
    locale: {
      subscribe: (fn: (value: string) => void) => {
        fn('fa');
        return () => {};
      },
    },
  };
});

// Mock svelte-i18n
vi.mock('svelte-i18n', () => {
  return {
    _: {
      subscribe: (fn: (value: any) => void) => {
        // Return a function that returns the key
        fn((key: string, options?: any) => key);
        return () => {};
      },
    },
    locale: {
      subscribe: (fn: (value: string) => void) => {
        fn('fa');
        return () => {};
      },
    },
  };
});

// Mock $app/environment
vi.mock('$app/environment', () => {
  return {
    browser: true,
    dev: false,
    building: false,
    version: '1.0.0',
  };
});

// Mock stores
vi.mock('$lib/stores', () => {
  return {
    authStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
        return () => {};
      },
      isAuthenticated: vi.fn(() => false),
      loginSuccess: vi.fn(),
      logout: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
    },
    isAuthenticated: {
      subscribe: (fn: (value: boolean) => void) => {
        fn(false);
        return () => {};
      },
    },
    currentUser: {
      subscribe: (fn: (value: any) => void) => {
        fn(null);
        return () => {};
      },
    },
    toastStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({ toasts: [] });
        return () => {};
      },
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
    vehiclesStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({ vehicles: [], isLoading: false, error: null });
        return () => {};
      },
      setVehicles: vi.fn(),
      addVehicle: vi.fn(),
      updateVehicle: vi.fn(),
      deleteVehicle: vi.fn(),
    },
    servicesStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({ services: [], isLoading: false, error: null });
        return () => {};
      },
      setServices: vi.fn(),
      addService: vi.fn(),
    },
    expensesStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({ expenses: [], isLoading: false, error: null });
        return () => {};
      },
      setExpenses: vi.fn(),
      addExpense: vi.fn(),
    },
    remindersStore: {
      subscribe: (fn: (value: any) => void) => {
        fn({ reminders: [], isLoading: false, error: null });
        return () => {};
      },
      setReminders: vi.fn(),
    },
    activeReminders: {
      subscribe: (fn: (value: any[]) => void) => {
        fn([]);
        return () => {};
      },
    },
  };
});

// Mock services
vi.mock('$lib/services', () => {
  return {
    authService: {
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
    vehicleService: {
      getAll: vi.fn(() => Promise.resolve([])),
      getById: vi.fn(() => Promise.resolve(null)),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    serviceService: {
      getAll: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    expenseService: {
      getAll: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reminderService: {
      getAll: vi.fn(() => Promise.resolve([])),
      refresh: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});
