import api from './api';
import type { ServiceRecord, ServiceFormData, ApiResponse } from '../types';

// Mock data
const mockServices: ServiceRecord[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '1403/09/15',
    km: 82000,
    cost: 1500000,
    type: 'oil_change',
    note: 'روغن موتور شل هلیکس',
    createdAt: '2024-12-05',
    updatedAt: '2024-12-05',
  },
  {
    id: '2',
    vehicleId: '1',
    date: '1403/06/10',
    km: 77000,
    cost: 800000,
    type: 'filter',
    note: 'فیلتر هوا و روغن',
    createdAt: '2024-08-31',
    updatedAt: '2024-08-31',
  },
  {
    id: '3',
    vehicleId: '2',
    date: '1403/08/20',
    km: 140000,
    cost: 2500000,
    type: 'brakes',
    note: 'تعویض لنت جلو',
    createdAt: '2024-11-10',
    updatedAt: '2024-11-10',
  },
];

const USE_MOCK = true;

export const serviceService = {
  /**
   * Get all services (optionally filtered by vehicle)
   */
  async getAll(vehicleId?: string): Promise<ServiceRecord[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (vehicleId) {
        return mockServices.filter(s => s.vehicleId === vehicleId);
      }
      return mockServices;
    }

    const params = vehicleId ? { vehicle_id: vehicleId } : {};
    const response = await api.get<ApiResponse<ServiceRecord[]>>('/services/', { params });
    return response.data.data;
  },

  /**
   * Get a service by ID
   */
  async getById(id: string): Promise<ServiceRecord> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const service = mockServices.find(s => s.id === id);
      if (!service) throw new Error('سرویس یافت نشد');
      return service;
    }

    const response = await api.get<ApiResponse<ServiceRecord>>(`/services/${id}/`);
    return response.data.data;
  },

  /**
   * Create a new service record
   */
  async create(data: ServiceFormData): Promise<ServiceRecord> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newService: ServiceRecord = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockServices.unshift(newService);
      return newService;
    }

    const response = await api.post<ApiResponse<ServiceRecord>>('/services/', data);
    return response.data.data;
  },

  /**
   * Update a service record
   */
  async update(id: string, data: Partial<ServiceFormData>): Promise<ServiceRecord> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockServices.findIndex(s => s.id === id);
      if (index === -1) throw new Error('سرویس یافت نشد');
      
      mockServices[index] = {
        ...mockServices[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockServices[index];
    }

    const response = await api.patch<ApiResponse<ServiceRecord>>(`/services/${id}/`, data);
    return response.data.data;
  },

  /**
   * Delete a service record
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockServices.findIndex(s => s.id === id);
      if (index !== -1) {
        mockServices.splice(index, 1);
      }
      return;
    }

    await api.delete(`/services/${id}/`);
  },

  /**
   * Get latest service for a vehicle
   */
  async getLatestForVehicle(vehicleId: string): Promise<ServiceRecord | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const services = mockServices
        .filter(s => s.vehicleId === vehicleId)
        .sort((a, b) => b.km - a.km);
      return services[0] || null;
    }

    const response = await api.get<ApiResponse<ServiceRecord | null>>(
      `/services/latest/${vehicleId}/`
    );
    return response.data.data;
  },
};
