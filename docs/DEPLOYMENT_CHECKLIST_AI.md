# Deployment Checklist - AI Service

این چک‌لیست برای اطمینان از عملکرد صحیح AI Service روی سرور production است.

## ⚠️ نکات مهم درباره Vite Environment Variables

**مهم**: در Vite، environment variables که با `VITE_` شروع می‌شوند **در زمان build** به کد embed می‌شوند. این یعنی:

1. ✅ باید در **زمان build** تنظیم شوند
2. ✅ نمی‌توانند بعد از build تغییر کنند
3. ✅ در فایل‌های build شده hardcode می‌شوند

## ✅ چک‌لیست قبل از Deploy

### 1. Environment Variables در زمان Build

باید این متغیرها در **زمان build** موجود باشند:

```env
# AI Configuration
VITE_AI_PROVIDER=openrouter  # یا gemini یا openai
VITE_AI_API_KEY=dummy  # برای proxy استفاده نمی‌شود، ولی باید موجود باشد
VITE_OPENROUTER_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy
# یا برای OpenAI:
# VITE_OPENAI_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy

# مدل‌ها (اختیاری)
VITE_AI_MODEL_EXPERT=anthropic/claude-3.5-sonnet
VITE_AI_MODEL_FAST=anthropic/claude-3-haiku
VITE_AI_MODEL_MAPS=anthropic/claude-3-haiku

# Supabase (باید موجود باشد)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**نکته**: `VITE_AI_API_KEY` در frontend فقط برای validation استفاده می‌شود. API key واقعی در Supabase Secrets نگهداری می‌شود.

### 2. Supabase Edge Function

#### ✅ Deploy شده باشد:
- [ ] Edge Function `ai-proxy` deploy شده باشد
- [ ] URL صحیح باشد: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy`

#### ✅ Secrets تنظیم شده باشند:
در Supabase Dashboard > Edge Functions > Settings > Secrets:

- [ ] `AI_API_KEY`: API Key واقعی (OpenRouter/Gemini/OpenAI)
- [ ] `AI_API_URL`: URL API مورد نظر
  - برای OpenRouter: `https://openrouter.ai/api/v1`
  - برای xiaomimimo: `https://api.xiaomimimo.com/v1`
  - برای OpenAI: `https://api.openai.com/v1`

### 3. Build Process

#### ✅ Build با Environment Variables صحیح:

```bash
# روش 1: استفاده از .env file (پیشنهادی)
cp .env.production .env  # یا فایل .env را برای production تنظیم کنید
npm run build

# روش 2: تنظیم inline (برای CI/CD)
VITE_AI_PROVIDER=openrouter \
VITE_AI_API_KEY=dummy \
VITE_OPENROUTER_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy \
npm run build
```

### 4. بررسی Build Output

بعد از build، بررسی کنید که:

- [ ] فایل‌های build در `build/` یا `dist/` ایجاد شده باشند
- [ ] هیچ خطای build وجود نداشته باشد
- [ ] Bundle size معقول باشد

### 5. تست روی Production

بعد از deploy:

- [ ] صفحه `/ai-consultant` باز می‌شود
- [ ] هیچ خطای console در browser وجود ندارد
- [ ] می‌توانید یک سوال بپرسید
- [ ] پاسخ از AI دریافت می‌شود
- [ ] در Network tab، request به `ai-proxy` با status 200 برمی‌گردد

## 🔍 عیب‌یابی

### خطای "AI API Key not configured"
- بررسی کنید که `VITE_AI_API_KEY` در زمان build موجود بوده
- بررسی کنید که `.env` file در build process خوانده شده

### خطای 401 Unauthorized از ai-proxy
- بررسی کنید که Secrets در Supabase تنظیم شده باشند
- بررسی کنید که Edge Function دوباره deploy شده باشد (بعد از تغییر Secrets)

### خطای CORS
- بررسی کنید که Edge Function CORS headers را به درستی برمی‌گرداند
- بررسی کنید که `Access-Control-Allow-Origin: *` در response headers موجود است

### خطای "Empty response"
- بررسی کنید که API key در Supabase Secrets صحیح است
- بررسی کنید که `AI_API_URL` در Supabase Secrets صحیح است
- لاگ‌های Edge Function را در Supabase Dashboard بررسی کنید

## 📝 مثال کامل برای CI/CD

```bash
# در CI/CD pipeline
export VITE_AI_PROVIDER=openrouter
export VITE_AI_API_KEY=dummy
export VITE_OPENROUTER_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy
export VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
export VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY  # از CI/CD secrets

npm run build
# یا
npm run chabokan:build  # برای deploy به سرور چابکان
```

## 🎯 خلاصه

✅ **باید انجام دهید:**
1. Environment variables را در زمان build تنظیم کنید
2. Supabase Edge Function را deploy کنید
3. Secrets را در Supabase تنظیم کنید
4. بعد از deploy تست کنید

❌ **نباید انجام دهید:**
1. API keys واقعی را در `.env` قرار ندهید (از Supabase Secrets استفاده کنید)
2. Environment variables را بعد از build تغییر ندهید (باید دوباره build کنید)

