import api from './api';
import type { Vehicle, VehicleFormData, ApiResponse } from '../types';

// Mock data for development
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    userId: '1',
    model: 'پژو ۲۰۶',
    year: 1398,
    plateNumber: '۱۲ب۳۴۵ - ۷۸',
    currentKm: 85000,
    note: 'خودروی اصلی',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    userId: '1',
    model: 'سمند LX',
    year: 1395,
    plateNumber: '۲۲ج۱۱۱ - ۳۳',
    currentKm: 142000,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
  },
];

const USE_MOCK = true;

export const vehicleService = {
  /**
   * Get all vehicles for current user
   */
  async getAll(): Promise<Vehicle[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockVehicles;
    }

    const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles/');
    return response.data.data;
  },

  /**
   * Get a single vehicle by ID
   */
  async getById(id: string): Promise<Vehicle> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const vehicle = mockVehicles.find(v => v.id === id);
      if (!vehicle) throw new Error('خودرو یافت نشد');
      return vehicle;
    }

    const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}/`);
    return response.data.data;
  },

  /**
   * Create a new vehicle
   */
  async create(data: VehicleFormData): Promise<Vehicle> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        userId: '1',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockVehicles.push(newVehicle);
      return newVehicle;
    }

    const response = await api.post<ApiResponse<Vehicle>>('/vehicles/', data);
    return response.data.data;
  },

  /**
   * Update a vehicle
   */
  async update(id: string, data: Partial<VehicleFormData>): Promise<Vehicle> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockVehicles.findIndex(v => v.id === id);
      if (index === -1) throw new Error('خودرو یافت نشد');
      
      mockVehicles[index] = {
        ...mockVehicles[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockVehicles[index];
    }

    const response = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}/`, data);
    return response.data.data;
  },

  /**
   * Delete a vehicle
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockVehicles.findIndex(v => v.id === id);
      if (index !== -1) {
        mockVehicles.splice(index, 1);
      }
      return;
    }

    await api.delete(`/vehicles/${id}/`);
  },

  /**
   * Update vehicle kilometers
   */
  async updateKm(id: string, km: number): Promise<Vehicle> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockVehicles.findIndex(v => v.id === id);
      if (index === -1) throw new Error('خودرو یافت نشد');
      
      mockVehicles[index].currentKm = km;
      mockVehicles[index].updatedAt = new Date().toISOString();
      return mockVehicles[index];
    }

    const response = await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}/km/`, { km });
    return response.data.data;
  },
};
