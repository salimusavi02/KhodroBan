# راهنمای تنظیم Mimo AI Provider

این راهنما نحوه استفاده از مدل `mimo-v2-flash` از xiaomimimo را توضیح می‌دهد.

## پیش‌نیازها

1. دریافت API Key از xiaomimimo
2. مدل `mimo-v2-flash` با استاندارد OpenAI سازگار است

## تنظیمات

### 1. فایل `.env`

فایل `.env` خود را به صورت زیر تنظیم کنید:

```env
# انتخاب provider (باید openai باشد چون mimo با استاندارد OpenAI سازگار است)
VITE_AI_PROVIDER=openai

# API Key از xiaomimimo
VITE_AI_API_KEY=YOUR_XIAOMIMIMO_API_KEY_HERE

# URL API
VITE_OPENAI_API_URL=https://api.xiaomimimo.com/v1

# مدل (برای همه mode‌ها می‌توانید mimo-v2-flash استفاده کنید)
VITE_AI_MODEL_EXPERT=mimo-v2-flash
VITE_AI_MODEL_FAST=mimo-v2-flash
VITE_AI_MODEL_MAPS=mimo-v2-flash
```

### 2. راه‌اندازی مجدد

بعد از تغییر `.env`، سرور توسعه را restart کنید:

```bash
npm run dev
```

## تست

1. به صفحه `/ai-consultant` بروید
2. یک سوال بپرسید
3. بررسی کنید که پاسخ از مدل mimo-v2-flash آمده باشد

## نکات مهم

- مدل mimo-v2-flash با استاندارد OpenAI سازگار است، بنابراین از `OpenAIProvider` استفاده می‌شود
- اگر API Key معتبر نباشد، خطا دریافت خواهید کرد
- می‌توانید از مدل‌های مختلف برای mode‌های مختلف استفاده کنید

## عیب‌یابی

### خطای "API Key not found"
- بررسی کنید که `VITE_AI_API_KEY` در `.env` تنظیم شده باشد
- بعد از تغییر `.env`، سرور را restart کنید

### خطای "Invalid API Key"
- API Key را از xiaomimimo بررسی کنید
- مطمئن شوید که API Key معتبر و فعال است

### خطای Connection
- بررسی کنید که `VITE_OPENAI_API_URL` درست تنظیم شده باشد: `https://api.xiaomimimo.com/v1`
- بررسی کنید که اینترنت متصل است

