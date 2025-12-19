import api from './api';
import type { User, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { authStore } from '../stores/auth';

// Mock data for development (when API is not available)
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'کاربر تست',
  tier: 'free',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const USE_MOCK = true; // Set to false when backend is ready

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    if (USE_MOCK) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (credentials.email && credentials.password) {
        const token = 'mock-jwt-token-' + Date.now();
        return { user: mockUser, token };
      }
      throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login/',
      credentials
    );
    return response.data.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        ...mockUser,
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { user: newUser, token };
    }

    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register/',
      data
    );
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }

    try {
      await api.post('/auth/logout/');
    } catch {
      // Ignore logout errors
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockUser;
    }

    const response = await api.get<ApiResponse<User>>('/auth/profile/');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockUser, ...data };
    }

    const response = await api.patch<ApiResponse<User>>('/auth/profile/', data);
    return response.data.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await api.post('/auth/forgot-password/', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await api.post('/auth/reset-password/', { token, password });
  },

  /**
   * Upgrade to Pro
   */
  async upgradeToPro(): Promise<{ redirectUrl: string }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real app, this would return a payment gateway URL
      return { redirectUrl: 'https://payment.example.com/checkout' };
    }

    const response = await api.post<ApiResponse<{ redirectUrl: string }>>('/auth/upgrade/');
    return response.data.data;
  },
};
