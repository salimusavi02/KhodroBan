# راهنمای تنظیم AI Proxy با Supabase Edge Functions

این راهنما نحوه استفاده از Supabase Edge Functions به عنوان proxy برای API های AI را توضیح می‌دهد تا مشکل CORS حل شود.

## چرا از Proxy استفاده کنیم؟

1. **حل مشکل CORS**: API های خارجی ممکن است CORS را برای درخواست‌های مستقیم از مرورگر پشتیبانی نکنند
2. **امنیت بهتر**: API Key در backend نگهداری می‌شود (نه در frontend)
3. **کنترل بیشتر**: می‌توانید rate limiting، logging و authentication اضافه کنید

## مراحل تنظیم

### 1. تنظیم Environment Variables در Supabase

1. به [Supabase Dashboard](https://supabase.com/dashboard) بروید
2. پروژه خود را انتخاب کنید
3. به **Edge Functions** > **Settings** > **Secrets** بروید
4. این secrets را اضافه کنید:

```
AI_API_KEY=your_xiaomimimo_api_key_here
AI_API_URL=https://api.xiaomimimo.com/v1
```

### 2. Deploy Edge Function

```bash
# اگر Supabase CLI نصب ندارید:
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project (project-ref را از Dashboard بگیرید)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
supabase functions deploy ai-proxy
```

**نکته**: project-ref را از URL Dashboard می‌توانید بگیرید:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

### 3. تنظیم Frontend

در فایل `.env`:

```env
VITE_AI_PROVIDER=openai
# URL Supabase Edge Function (project-ref خود را جایگزین کنید)
VITE_OPENAI_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy
# این API Key استفاده نمی‌شود (از Supabase secret استفاده می‌شود)
VITE_AI_API_KEY=dummy

# مدل
VITE_AI_MODEL_EXPERT=mimo-v2-flash
VITE_AI_MODEL_FAST=mimo-v2-flash
VITE_AI_MODEL_MAPS=mimo-v2-flash
```

### 4. راه‌اندازی مجدد

```bash
cd frontend
npm run dev
```

## نحوه کار

1. Frontend درخواست را به `https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-proxy/chat/completions` می‌فرستد
2. Edge Function درخواست را به `https://api.xiaomimimo.com/v1/chat/completions` forward می‌کند
3. پاسخ برگشته و به frontend ارسال می‌شود

## تست

1. به صفحه `/ai-consultant` بروید
2. یک سوال بپرسید
3. بررسی کنید که پاسخ دریافت می‌شود

## عیب‌یابی

### خطای "AI API Key not configured"
- بررسی کنید که `AI_API_KEY` در Supabase Secrets تنظیم شده باشد
- بعد از اضافه کردن secret، function را دوباره deploy کنید

### خطای 404
- بررسی کنید که function به درستی deploy شده باشد: `supabase functions list`
- URL را بررسی کنید: باید شامل `/functions/v1/ai-proxy` باشد

### خطای CORS
- اگر هنوز CORS error می‌بینید، بررسی کنید که Edge Function CORS headers را اضافه کرده باشد
- Function را دوباره deploy کنید

## امنیت

- ✅ API Key در Supabase Secrets نگهداری می‌شود (نه در frontend)
- ✅ می‌توانید authentication اضافه کنید (در Edge Function)
- ✅ می‌توانید rate limiting اضافه کنید
- ✅ می‌توانید logging اضافه کنید

## تغییر به Provider دیگر

اگر می‌خواهید از provider دیگری استفاده کنید:

1. در Supabase Secrets، `AI_API_URL` را تغییر دهید
2. در `.env`، مدل‌ها را تغییر دهید
3. Function را دوباره deploy کنید (اگر نیاز بود)

