import { writable, derived, get } from 'svelte/store';
import type { KmHistoryState, KmHistoryRecord } from '../types';

const initialState: KmHistoryState = {
  history: [],
  isLoading: false,
  error: null,
};

function createKmHistoryStore() {
  const { subscribe, set, update } = writable<KmHistoryState>(initialState);

  return {
    subscribe,

    // Set loading state
    setLoading(isLoading: boolean) {
      update((state) => ({ ...state, isLoading, error: null }));
    },

    // Set history
    setHistory(history: KmHistoryRecord[]) {
      update((state) => ({
        ...state,
        history,
        isLoading: false,
        error: null,
      }));
    },

    // Add a new record to history
    addRecord(record: KmHistoryRecord) {
      update((state) => ({
        ...state,
        history: [record, ...state.history],
      }));
    },

    // Update existing record
    updateRecord(id: string, data: Partial<KmHistoryRecord>) {
      update((state) => ({
        ...state,
        history: state.history.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }));
    },

    // Delete a record
    deleteRecord(id: string) {
      update((state) => ({
        ...state,
        history: state.history.filter((r) => r.id !== id),
      }));
    },

    // Set error
    setError(error: string) {
      update((state) => ({ ...state, error, isLoading: false }));
    },

    // Clear state
    clear() {
      set(initialState);
    },

    // Get last KM record
    getLastKm(): KmHistoryRecord | null {
      const state = get({ subscribe });
      return state.history.length > 0 ? state.history[0] : null;
    },

    // Get history for specific source type
    getBySource(sourceType: string): KmHistoryRecord[] {
      const state = get({ subscribe });
      return state.history.filter((r) => r.sourceType === sourceType);
    },
  };
}

export const kmHistoryStore = createKmHistoryStore();

// Derived stores
export const lastKmRecord = derived(kmHistoryStore, ($store) => 
  $store.history.length > 0 ? $store.history[0] : null
);

export const lastKm = derived(lastKmRecord, ($record) => 
  $record ? $record.km : null
);

export const kmHistoryCount = derived(kmHistoryStore, ($store) => 
  $store.history.length
);

// Derived store for KM history by source type
export const manualKmRecords = derived(kmHistoryStore, ($store) => 
  $store.history.filter((r) => r.sourceType === 'manual')
);

export const serviceKmRecords = derived(kmHistoryStore, ($store) => 
  $store.history.filter((r) => r.sourceType === 'service')
);

export const expenseKmRecords = derived(kmHistoryStore, ($store) => 
  $store.history.filter((r) => r.sourceType === 'expense')
);

