// ========================================
// Google Gemini AI Provider
// ========================================

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { IAIProvider } from '../base';
import type { AIRequestParams, AIResponse, AIProviderInfo, AIProviderConfig } from '../types';

export class GeminiProvider implements IAIProvider {
  private apiKey: string;
  private client: GoogleGenAI | null = null;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  getInfo(): AIProviderInfo {
    return {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google Gemini AI models',
      requiresApiKey: true,
      supportsImages: true,
      supportsMaps: true,
      supportsDeepThinking: true,
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async analyzeCarIssue(params: AIRequestParams): Promise<AIResponse> {
    if (!this.client) {
      return {
        text: "خطا: Gemini API Key تنظیم نشده است. لطفاً با مدیر سیستم تماس بگیرید.",
        groundingChunks: []
      };
    }

    let modelName = 'gemini-3-pro-preview'; // Default
    const config: any = {};
    const tools: any[] = [];

    // انتخاب مدل بر اساس mode
    if (params.mode === 'fast') {
      modelName = 'gemini-flash-lite-latest';
    } else if (params.mode === 'maps') {
      modelName = 'gemini-2.5-flash';
      tools.push({ googleMaps: {} });
      if (params.location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: params.location.latitude,
              longitude: params.location.longitude
            }
          }
        };
      }
    } else if (params.mode === 'expert') {
      modelName = 'gemini-3-pro-preview';
      if (params.deepThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }
    }

    // اگر مدل خاصی تعیین شده باشد، از آن استفاده کن
    if (params.model) {
      modelName = params.model;
    }

    const parts: any[] = [{ text: params.prompt }];
    
    if (params.base64Image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: params.base64Image
        }
      });
    }

    try {
      const response: GenerateContentResponse = await this.client.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          ...config,
          tools: tools.length > 0 ? tools : undefined
        }
      });
      
      return {
        text: response.text || "پاسخی دریافت نشد.",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        text: "متاسفانه مشکلی در برقراری ارتباط با هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.",
        groundingChunks: [],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

