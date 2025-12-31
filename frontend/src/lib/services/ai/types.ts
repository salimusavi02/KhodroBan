// ========================================
// AI Service Types
// ========================================

/**
 * حالت‌های مختلف مدل AI
 */
export type AIModelMode = 'expert' | 'fast' | 'maps';

/**
 * Providerهای مختلف AI
 */
export type AIProvider = 'gemini' | 'openai' | 'openrouter';

/**
 * تنظیمات برای درخواست AI
 */
export interface AIRequestParams {
  prompt: string;
  base64Image?: string;
  deepThinking?: boolean;
  mode: AIModelMode;
  location?: {
    latitude: number;
    longitude: number;
  };
  /** مدل خاص (اختیاری - اگر provider به پشتیبانی از مدل‌های مختلف نیاز داشته باشد) */
  model?: string;
}

/**
 * پاسخ از AI
 */
export interface AIResponse {
  text: string;
  groundingChunks?: any[];
  /** متادیتای اضافی که provider می‌تواند برگرداند */
  metadata?: Record<string, any>;
}

/**
 * تنظیمات Provider
 */
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  /** URL پایه (برای OpenRouter یا custom endpoints) */
  baseURL?: string;
  /** مدل پیش‌فرض برای هر mode */
  defaultModels?: {
    expert?: string;
    fast?: string;
    maps?: string;
  };
}

/**
 * اطلاعات Provider
 */
export interface AIProviderInfo {
  id: AIProvider;
  name: string;
  description: string;
  /** آیا این provider نیاز به API Key دارد؟ */
  requiresApiKey: boolean;
  /** آیا این provider از تصویر پشتیبانی می‌کند؟ */
  supportsImages: boolean;
  /** آیا این provider از maps پشتیبانی می‌کند؟ */
  supportsMaps: boolean;
  /** آیا این provider از deep thinking پشتیبانی می‌کند؟ */
  supportsDeepThinking: boolean;
}

