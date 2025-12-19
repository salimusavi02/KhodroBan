import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { authStore } from '../stores/auth';
import { toastStore } from '../stores/ui';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = getErrorMessage(error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      authStore.logout();
      window.location.hash = '#/login';
      toastStore.error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
    }
    
    // Handle 403 Forbidden (e.g., Pro feature for free user)
    if (error.response?.status === 403) {
      toastStore.warning('این قابلیت برای کاربران Pro در دسترس است.');
    }
    
    // Handle network errors
    if (!error.response) {
      toastStore.error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
    }
    
    return Promise.reject(error);
  }
);

// Helper to get error message
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
  }
  
  if (!error.response) {
    return 'خطا در اتصال به سرور';
  }
  
  switch (error.response.status) {
    case 400: return 'درخواست نامعتبر است';
    case 401: return 'لطفاً وارد حساب کاربری خود شوید';
    case 403: return 'شما دسترسی به این بخش ندارید';
    case 404: return 'مورد درخواستی یافت نشد';
    case 422: return 'اطلاعات وارد شده نامعتبر است';
    case 500: return 'خطای سرور. لطفاً بعداً تلاش کنید';
    default: return 'خطای ناشناخته';
  }
}

export default api;
export { getErrorMessage };
