import { writable, derived, get } from 'svelte/store';
import type { Vehicle, VehiclesState } from '../types';

const initialState: VehiclesState = {
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,
};

function createVehiclesStore() {
  const { subscribe, set, update } = writable<VehiclesState>(initialState);

  return {
    subscribe,

    // Set loading state
    setLoading(isLoading: boolean) {
      update(state => ({ ...state, isLoading, error: null }));
    },

    // Set vehicles list
    setVehicles(vehicles: Vehicle[]) {
      update(state => ({
        ...state,
        vehicles,
        isLoading: false,
        error: null,
      }));
    },

    // Add a new vehicle
    addVehicle(vehicle: Vehicle) {
      update(state => ({
        ...state,
        vehicles: [...state.vehicles, vehicle],
      }));
    },

    // Update a vehicle
    updateVehicle(id: string, data: Partial<Vehicle>) {
      update(state => ({
        ...state,
        vehicles: state.vehicles.map(v => 
          v.id === id ? { ...v, ...data } : v
        ),
        selectedVehicle: state.selectedVehicle?.id === id 
          ? { ...state.selectedVehicle, ...data }
          : state.selectedVehicle,
      }));
    },

    // Delete a vehicle
    deleteVehicle(id: string) {
      update(state => ({
        ...state,
        vehicles: state.vehicles.filter(v => v.id !== id),
        selectedVehicle: state.selectedVehicle?.id === id 
          ? null 
          : state.selectedVehicle,
      }));
    },

    // Select a vehicle
    selectVehicle(vehicle: Vehicle | null) {
      update(state => ({ ...state, selectedVehicle: vehicle }));
    },

    // Update vehicle kilometers
    updateKilometers(id: string, km: number) {
      update(state => ({
        ...state,
        vehicles: state.vehicles.map(v => 
          v.id === id ? { ...v, currentKm: km } : v
        ),
      }));
    },

    // Set error
    setError(error: string) {
      update(state => ({ ...state, error, isLoading: false }));
    },

    // Clear state
    clear() {
      set(initialState);
    },

    // Get vehicle by ID
    getById(id: string): Vehicle | undefined {
      const state = get({ subscribe });
      return state.vehicles.find(v => v.id === id);
    },
  };
}

export const vehiclesStore = createVehiclesStore();

// Derived stores
export const vehicleCount = derived(vehiclesStore, $store => $store.vehicles.length);

export const vehicleOptions = derived(vehiclesStore, $store => 
  $store.vehicles.map(v => ({
    value: v.id,
    label: `${v.model} (${v.plateNumber})`,
  }))
);
