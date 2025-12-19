// ========================================
// Application Constants
// ========================================

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'خودروبان';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Service Types
export const SERVICE_TYPES = {
  oil_change: 'تعویض روغن',
  filter: 'فیلتر',
  brakes: 'ترمز',
  other: 'سایر',
} as const;

export const SERVICE_TYPE_OPTIONS = [
  { value: 'oil_change', label: 'تعویض روغن' },
  { value: 'filter', label: 'فیلتر (هوا/روغن/بنزین)' },
  { value: 'brakes', label: 'ترمز (لنت/دیسک)' },
  { value: 'other', label: 'سایر' },
];

// Expense Categories
export const EXPENSE_CATEGORIES = {
  fuel: 'سوخت',
  wash: 'کارواش',
  parking: 'پارکینگ',
  toll: 'عوارض',
  minor_repair: 'تعمیرات جزئی',
  other: 'سایر',
} as const;

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'fuel', label: 'سوخت' },
  { value: 'wash', label: 'کارواش' },
  { value: 'parking', label: 'پارکینگ' },
  { value: 'toll', label: 'عوارض' },
  { value: 'minor_repair', label: 'تعمیرات جزئی' },
  { value: 'other', label: 'سایر' },
];

// Expense Category Icons (emoji)
export const EXPENSE_ICONS = {
  fuel: '⛽',
  wash: '🚿',
  parking: '🅿️',
  toll: '🛣️',
  minor_repair: '🔧',
  other: '📋',
} as const;

// Reminder Channels
export const REMINDER_CHANNELS = {
  inApp: 'اعلان داخل برنامه',
  email: 'ایمیل',
  sms: 'پیامک (Pro)',
} as const;

export const REMINDER_CHANNEL_OPTIONS = [
  { value: 'inApp', label: 'اعلان داخل برنامه' },
  { value: 'email', label: 'ایمیل' },
  { value: 'sms', label: 'پیامک', isPro: true },
];

// Reminder Status
export const REMINDER_STATUS = {
  ok: { label: 'عادی', color: 'success' },
  near: { label: 'نزدیک موعد', color: 'warning' },
  overdue: { label: 'گذشته از موعد', color: 'danger' },
} as const;

// Default Settings
export const DEFAULT_KM_INTERVAL = 5000;
export const DEFAULT_TIME_INTERVAL_MONTHS = 3;
export const DEFAULT_ALERT_DAYS_BEFORE = 7;

// Freemium Limits
export const FREE_TIER_LIMITS = {
  maxVehicles: 2,
  hasCloudSync: false,
  hasExportPDF: false,
  hasSMSReminder: false,
  hasAdvancedReports: false,
};

export const PRO_TIER_FEATURES = {
  maxVehicles: Infinity,
  hasCloudSync: true,
  hasExportPDF: true,
  hasSMSReminder: true,
  hasAdvancedReports: true,
};

// Navigation Menu Items
export const MENU_ITEMS = [
  { path: '/dashboard', label: 'داشبورد', icon: '🏠' },
  { path: '/vehicles', label: 'خودروها', icon: '🚗' },
  { path: '/add', label: 'ثبت جدید', icon: '➕' },
  { path: '/reports', label: 'گزارش‌ها', icon: '📊' },
  { path: '/settings', label: 'تنظیمات', icon: '⚙️' },
];

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
} as const;

// Date format patterns
export const DATE_FORMATS = {
  display: 'jYYYY/jMM/jDD',
  api: 'YYYY-MM-DD',
  full: 'jYYYY/jMM/jDD - HH:mm',
} as const;

// Polling intervals (in milliseconds)
export const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes for reminder refresh
