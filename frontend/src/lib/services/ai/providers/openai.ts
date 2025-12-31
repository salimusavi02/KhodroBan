// ========================================
// OpenAI/OpenRouter AI Provider
// ========================================

import OpenAI from 'openai';
import type { IAIProvider } from '../base';
import type { AIRequestParams, AIResponse, AIProviderInfo, AIProviderConfig, AIModelMode } from '../types';

export class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private baseURL?: string;
  private defaultModels: {
    expert?: string;
    fast?: string;
    maps?: string;
  };
  private client: OpenAI | null = null;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.defaultModels = config.defaultModels || {};
    
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
        // برای OpenRouter نیاز به header اضافی است
        defaultHeaders: this.baseURL?.includes('openrouter.ai') 
          ? { 'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '' }
          : undefined,
      });
    }
  }

  getInfo(): AIProviderInfo {
    const isOpenRouter = this.baseURL?.includes('openrouter.ai');
    return {
      id: isOpenRouter ? 'openrouter' : 'openai',
      name: isOpenRouter ? 'OpenRouter' : 'OpenAI',
      description: isOpenRouter 
        ? 'OpenRouter - Multiple AI models' 
        : 'OpenAI GPT models',
      requiresApiKey: true,
      supportsImages: true, // GPT-4 Vision supports images
      supportsMaps: false, // OpenAI doesn't have built-in maps support
      supportsDeepThinking: false, // OpenAI doesn't have deep thinking mode
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  /**
   * انتخاب مدل بر اساس mode و تنظیمات
   */
  private getModelForMode(mode: AIModelMode, customModel?: string): string {
    if (customModel) {
      return customModel;
    }

    switch (mode) {
      case 'expert':
        return this.defaultModels.expert || 'gpt-4-turbo-preview';
      case 'fast':
        return this.defaultModels.fast || 'gpt-3.5-turbo';
      case 'maps':
        // برای maps از expert model استفاده می‌کنیم چون OpenAI maps ندارد
        return this.defaultModels.maps || this.defaultModels.expert || 'gpt-4-turbo-preview';
      default:
        return 'gpt-3.5-turbo';
    }
  }

  async analyzeCarIssue(params: AIRequestParams): Promise<AIResponse> {
    if (!this.client) {
      return {
        text: "خطا: OpenAI API Key تنظیم نشده است. لطفاً با مدیر سیستم تماس بگیرید.",
        groundingChunks: []
      };
    }

    const model = this.getModelForMode(params.mode, params.model);
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'شما یک مشاور هوشمند خودرو هستید که به زبان فارسی پاسخ می‌دهید. به سوالات کاربران درباره مشکلات خودرو، نگهداری، تعمیرات و سرویس‌های دوره‌ای پاسخ می‌دهید.'
      },
      {
        role: 'user',
        content: this.buildContent(params)
      }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: params.deepThinking ? 0.7 : 0.9,
        max_tokens: params.mode === 'expert' ? 2000 : 1000,
      });

      const text = response.choices[0]?.message?.content || "پاسخی دریافت نشد.";
      
      return {
        text,
        metadata: {
          model: response.model,
          usage: response.usage,
        }
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return {
        text: "متاسفانه مشکلی در برقراری ارتباط با هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.",
        groundingChunks: [],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * ساخت محتوای پیام - پشتیبانی از تصویر و متن
   */
  private buildContent(params: AIRequestParams): OpenAI.Chat.Completions.ChatCompletionContentPart[] {
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

    // اضافه کردن متن
    if (params.prompt) {
      content.push({
        type: 'text',
        text: params.prompt
      });
    }

    // اضافه کردن تصویر (اگر مدل از vision پشتیبانی کند)
    if (params.base64Image) {
      // برای GPT-4 Vision یا مدل‌های مشابه
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${params.base64Image}`
        }
      });
    }

    return content.length > 0 ? content : [{ type: 'text', text: '' }];
  }
}

