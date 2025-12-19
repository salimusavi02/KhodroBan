import api from './api';
import type { Reminder, ReminderSettings, ApiResponse } from '../types';
import { vehicleService } from './vehicleService';
import { serviceService } from './serviceService';

// Mock reminders - these would normally be calculated on the backend
const mockReminders: Reminder[] = [
  {
    id: '1',
    vehicleId: '1',
    vehicleName: 'پژو ۲۰۶',
    type: 'oil_change',
    status: 'near',
    dueKm: 87000,
    currentKm: 85000,
    lastServiceDate: '1403/09/15',
    lastServiceKm: 82000,
    message: 'تعویض روغن موتور تا ۲۰۰۰ کیلومتر دیگر',
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    vehicleId: '2',
    vehicleName: 'سمند LX',
    type: 'oil_change',
    status: 'overdue',
    dueKm: 140000,
    currentKm: 142000,
    lastServiceDate: '1403/05/10',
    lastServiceKm: 135000,
    message: 'موعد تعویض روغن گذشته است! ۲۰۰۰ کیلومتر تأخیر',
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
];

const USE_MOCK = true;

export const reminderService = {
  /**
   * Get all reminders for current user
   */
  async getAll(): Promise<Reminder[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockReminders;
    }

    const response = await api.get<ApiResponse<Reminder[]>>('/reminders/');
    return response.data.data;
  },

  /**
   * Get reminders for a specific vehicle
   */
  async getByVehicle(vehicleId: string): Promise<Reminder[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockReminders.filter(r => r.vehicleId === vehicleId);
    }

    const response = await api.get<ApiResponse<Reminder[]>>(`/reminders/vehicle/${vehicleId}/`);
    return response.data.data;
  },

  /**
   * Dismiss a reminder
   */
  async dismiss(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const reminder = mockReminders.find(r => r.id === id);
      if (reminder) {
        reminder.dismissed = true;
      }
      return;
    }

    await api.post(`/reminders/${id}/dismiss/`);
  },

  /**
   * Get reminder settings
   */
  async getSettings(): Promise<ReminderSettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        kmInterval: 5000,
        timeIntervalMonths: 3,
        alertDaysBefore: 7,
        channels: ['inApp', 'email'],
      };
    }

    const response = await api.get<ApiResponse<ReminderSettings>>('/reminders/settings/');
    return response.data.data;
  },

  /**
   * Update reminder settings
   */
  async updateSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        kmInterval: settings.kmInterval ?? 5000,
        timeIntervalMonths: settings.timeIntervalMonths ?? 3,
        alertDaysBefore: settings.alertDaysBefore ?? 7,
        channels: settings.channels ?? ['inApp'],
      };
    }

    const response = await api.patch<ApiResponse<ReminderSettings>>(
      '/reminders/settings/',
      settings
    );
    return response.data.data;
  },

  /**
   * Calculate reminders client-side (for display purposes)
   * This is a helper function that calculates reminder status based on current data
   */
  calculateStatus(
    currentKm: number,
    lastServiceKm: number,
    kmInterval: number,
    lastServiceDate: string,
    timeIntervalMonths: number,
    alertDaysBefore: number
  ): { status: 'ok' | 'near' | 'overdue'; dueKm: number; message: string } {
    const dueKm = lastServiceKm + kmInterval;
    const kmRemaining = dueKm - currentKm;
    
    // Calculate date-based status
    // This is simplified - in production you'd use proper date math
    const alertKmThreshold = 1000; // Alert when 1000km remaining
    
    if (kmRemaining <= 0) {
      return {
        status: 'overdue',
        dueKm,
        message: `موعد تعویض روغن گذشته است! ${Math.abs(kmRemaining).toLocaleString('fa-IR')} کیلومتر تأخیر`,
      };
    } else if (kmRemaining <= alertKmThreshold) {
      return {
        status: 'near',
        dueKm,
        message: `تعویض روغن تا ${kmRemaining.toLocaleString('fa-IR')} کیلومتر دیگر`,
      };
    } else {
      return {
        status: 'ok',
        dueKm,
        message: `سرویس بعدی در کیلومتر ${dueKm.toLocaleString('fa-IR')}`,
      };
    }
  },

  /**
   * Refresh reminders (poll for updates)
   */
  async refresh(): Promise<Reminder[]> {
    return this.getAll();
  },
};
