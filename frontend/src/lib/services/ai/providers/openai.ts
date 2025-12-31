// ========================================
// OpenAI/OpenRouter AI Provider
// ========================================

import OpenAI from 'openai';
import type { IAIProvider } from '../base';
import type { AIRequestParams, AIResponse, AIProviderInfo, AIProviderConfig, AIModelMode } from '../types';
import { formatUserContextForPrompt, formatConversationContextForPrompt } from '../utils';

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
      const isSupabaseProxy = this.baseURL?.includes('supabase.co/functions/v1');
      
      // دریافت Supabase anon key برای Edge Functions
      const supabaseAnonKey = isSupabaseProxy 
        ? import.meta.env.VITE_SUPABASE_ANON_KEY 
        : undefined;
      
      // ساخت defaultHeaders (فقط برای OpenRouter)
      const defaultHeaders: Record<string, string> = {};
      
      if (this.baseURL?.includes('openrouter.ai')) {
        defaultHeaders['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : '';
      }
      
      // Custom fetch برای Supabase proxy که headers apikey و Authorization را اضافه می‌کند
      // این بهتر از defaultHeaders است چون OpenAI client ممکن است headers را override کند
      // Supabase Edge Functions نیاز به header 'apikey' و 'Authorization' با anon key دارند
      const customFetch = isSupabaseProxy && supabaseAnonKey
        ? (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const headers = new Headers(init?.headers);
            // اضافه کردن apikey header
            headers.set('apikey', supabaseAnonKey);
            // override کردن Authorization header با Supabase anon key (به جای dummy)
            headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
            return fetch(input, { ...init, headers });
          }
        : undefined;
      
      this.client = new OpenAI({
        // برای Supabase proxy، API Key از Supabase secret استفاده می‌شود
        // پس dummy key می‌فرستیم
        apiKey: isSupabaseProxy ? 'dummy' : this.apiKey,
        baseURL: this.baseURL,
        // اجازه استفاده در مرورگر (برای frontend applications)
        // نکته: این فقط برای API Key‌های public/frontend استفاده می‌شود
        // هرگز secret key را در frontend قرار ندهید!
        dangerouslyAllowBrowser: true,
        // اضافه کردن headers اضافی
        defaultHeaders: Object.keys(defaultHeaders).length > 0 ? defaultHeaders : undefined,
        // استفاده از custom fetch برای Supabase proxy
        fetch: customFetch,
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
    
    // ساخت system prompt با context
    let systemPrompt = 'شما یک مشاور هوشمند خودرو هستید که به زبان فارسی پاسخ می‌دهید. به سوالات کاربران درباره مشکلات خودرو، نگهداری، تعمیرات و سرویس‌های دوره‌ای پاسخ می‌دهید.';
    
    // اضافه کردن user context (اطلاعات خودرو و سوابق)
    if (params.userContext) {
      const userContextText = formatUserContextForPrompt(params.userContext);
      if (userContextText) {
        systemPrompt += '\n\nشما به اطلاعات زیر از کاربر دسترسی دارید. از این اطلاعات برای ارائه راهنمایی‌های دقیق‌تر و شخصی‌سازی‌شده استفاده کنید:';
        systemPrompt += userContextText;
      }
    }

    // ساخت messages با conversation context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // اضافه کردن تاریخچه گفتگو (conversation context)
    if (params.conversationContext?.messages && params.conversationContext.messages.length > 0) {
      const maxHistory = params.conversationContext.maxHistoryMessages || 10;
      const historyMessages = params.conversationContext.messages.slice(-maxHistory);
      
      historyMessages.forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // اضافه کردن پیام فعلی
    messages.push({
      role: 'user',
      content: this.buildContent(params)
    });

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

