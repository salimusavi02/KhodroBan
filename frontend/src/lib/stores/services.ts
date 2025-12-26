import { writable, derived, get } from 'svelte/store';
import type { ServiceRecord, ServicesState } from '../types';

const initialState: ServicesState = {
  services: [],
  isLoading: false,
  error: null,
};

function createServicesStore() {
  const { subscribe, set, update } = writable<ServicesState>(initialState);

  return {
    subscribe,

    setLoading(isLoading: boolean) {
      update((state) => ({ ...state, isLoading, error: null }));
    },

    setServices(services: ServiceRecord[]) {
      update((state) => ({
        ...state,
        services,
        isLoading: false,
        error: null,
      }));
    },

    addService(service: ServiceRecord) {
      update((state) => ({
        ...state,
        services: [service, ...state.services],
      }));
    },

    updateService(id: string, data: Partial<ServiceRecord>) {
      update((state) => ({
        ...state,
        services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
      }));
    },

    deleteService(id: string) {
      update((state) => ({
        ...state,
        services: state.services.filter((s) => s.id !== id),
      }));
    },

    setError(error: string) {
      update((state) => ({ ...state, error, isLoading: false }));
    },

    // Get services by vehicle ID
    getByVehicle(vehicleId: string): ServiceRecord[] {
      const state = get({ subscribe });
      return state.services.filter((s) => s.vehicleId === vehicleId);
    },

    // Get latest service for a vehicle
    getLatest(vehicleId: string): ServiceRecord | undefined {
      const services = this.getByVehicle(vehicleId);
      return services.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    },

    clear() {
      set(initialState);
    },
  };
}

export const servicesStore = createServicesStore();

// Derived: services grouped by vehicle
export const servicesByVehicle = derived(servicesStore, ($store) => {
  const grouped: Record<string, ServiceRecord[]> = {};
  $store.services.forEach((service) => {
    if (!grouped[service.vehicleId]) {
      grouped[service.vehicleId] = [];
    }
    grouped[service.vehicleId].push(service);
  });
  return grouped;
});

// Derived: total service cost
export const totalServiceCost = derived(servicesStore, ($store) =>
  $store.services.reduce((sum, s) => sum + s.cost, 0)
);
