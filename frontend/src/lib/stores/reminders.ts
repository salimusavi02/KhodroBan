import { writable, derived, get } from 'svelte/store';
import type { Reminder, ReminderSettings, RemindersState } from '../types';

const defaultSettings: ReminderSettings = {
  kmInterval: 5000,
  timeIntervalMonths: 3,
  alertDaysBefore: 7,
  channels: ['inApp'],
};

const initialState: RemindersState = {
  reminders: [],
  settings: defaultSettings,
  isLoading: false,
  error: null,
};

function createRemindersStore() {
  const { subscribe, set, update } = writable<RemindersState>(initialState);

  return {
    subscribe,

    setLoading(isLoading: boolean) {
      update((state) => ({ ...state, isLoading, error: null }));
    },

    setReminders(reminders: Reminder[]) {
      update((state) => ({
        ...state,
        reminders,
        isLoading: false,
        error: null,
      }));
    },

    addReminder(reminder: Reminder) {
      update((state) => ({
        ...state,
        reminders: [reminder, ...state.reminders],
      }));
    },

    updateReminder(id: string, data: Partial<Reminder>) {
      update((state) => ({
        ...state,
        reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }));
    },

    dismissReminder(id: string) {
      update((state) => ({
        ...state,
        reminders: state.reminders.map((r) => (r.id === id ? { ...r, dismissed: true } : r)),
      }));
    },

    setSettings(settings: Partial<ReminderSettings>) {
      update((state) => ({
        ...state,
        settings: { ...state.settings, ...settings },
      }));
    },

    setError(error: string) {
      update((state) => ({ ...state, error, isLoading: false }));
    },

    getActiveReminders(): Reminder[] {
      const state = get({ subscribe });
      return state.reminders.filter((r) => !r.dismissed);
    },

    getByVehicle(vehicleId: string): Reminder[] {
      const state = get({ subscribe });
      return state.reminders.filter((r) => r.vehicleId === vehicleId);
    },

    clear() {
      set(initialState);
    },
  };
}

export const remindersStore = createRemindersStore();

// Derived: active (not dismissed) reminders
export const activeReminders = derived(remindersStore, ($store) =>
  $store.reminders.filter((r) => !r.dismissed)
);

// Derived: overdue reminders
export const overdueReminders = derived(remindersStore, ($store) =>
  $store.reminders.filter((r) => !r.dismissed && r.status === 'overdue')
);

// Derived: near-due reminders
export const nearDueReminders = derived(remindersStore, ($store) =>
  $store.reminders.filter((r) => !r.dismissed && r.status === 'near')
);

// Derived: reminder count by status
export const reminderStats = derived(remindersStore, ($store) => {
  const active = $store.reminders.filter((r) => !r.dismissed);
  return {
    total: active.length,
    ok: active.filter((r) => r.status === 'ok').length,
    near: active.filter((r) => r.status === 'near').length,
    overdue: active.filter((r) => r.status === 'overdue').length,
  };
});
