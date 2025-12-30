# سیستم یادآوری سرویس دوره‌ای خودروها با Python

## 📋 اطلاعات کلی

**تاریخ ایجاد:** ۲۷ دی ۱۴۰۴  
**نوع پروژه:** Python Cron Job + Supabase + SPA + Telegram  
**هدف:** یادآوری خودکار سرویس دوره‌ای خودروها از طریق چندکاناله (نوتیفیکیشن + تلگرام)

---

## 🆕 ویژگی‌های جدید (با تلگرام)

✅ **ارسال یادآوری به تلگرام** - کاربران می‌توانند ربات تلگرام رو متصل کنند  
✅ **قابلیت انتخاب کانال** - کاربر انتخاب می‌کند چطور یادآوری دریافت کند  
✅ **پیام‌های زیبا** - استفاده از HTML برای متن‌های خوانا  
✅ **اتصال امن** - ذخیره `chat_id` در دیتابیس با RLS  
✅ **Realtime + Telegram** - همزمان دریافت کنید

---

## 🎯 سیناریو و هدف کلی

### سیناریو:

- کاربر **چندین خودرو** دارد
- هر خودرو نیاز به **سرویس دوره‌ای با فاصله زمانی متفاوت** دارد (مثلاً ۶۰، ۹۰ یا ۱۲۰ روز)
- این تنظیمات در جدول `reminder_settings` برای هر خودرو ذخیره شده است
- کاربر می‌خواهد **چند روز قبل** از موعد (مثلاً ۷ روز)، یادآوری دریافت کند
- یادآوری از طریق: **ایمیل + نوتیفیکیشن درون‌برنامه‌ای**

### هدف:

- **خودکارسازی:** بدون نیاز به یادآوری دستی
- **زمان‌بندی دقیق:** بررسی روزانه
- **چندکاناله:** ایمیل + نوتیفیکیشن + تلگرام
- **قابل تنظیم:** هر کاربر برای هر خودرو تنظیمات مخصوص دارد

---

## 🏗️ معماری سیستم

```
┌─────────────────────────────────────────────────────────────┐
│  Python Cron Job (چابکان)                                   │
│  - اجرا: هر روز ساعت ۸ صبح                                   │
│  - وظیفه: بررسی یادآورها + ایجاد نوتیفیکیشن                │
│  - ارسال به تلگرام (اگر فعال باشد)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Supabase (دیتابیس)                                         │
│  - جدول notifications (نوتیفیکیشن‌ها)                       │
│  - جدول telegram_settings (تنظیمات تلگرام کاربران)          │
│  - جدول reminder_settings (تنظیمات هر خودرو)                │
│  - جدول vehicles + services (اطلاعات خودروها)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SPA فرانت‌اند (SvelteKit)                                   │
│  - Realtime Supabase (نمایش فوری)                           │
│  - notificationService.ts (خواندن نوتیفیکیشن‌ها)           │
│  - telegramService.ts (مدیریت اتصال تلگرام)                │
│  - UI کامپوننت (نمایش و مدیریت)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Telegram Bot API                                           │
│  - ارسال یادآوری به کاربران                                 │
│  - پشتیبانی از HTML برای متن زیبا                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 مراحل اجرا (۶ مرحله)

### مرحله ۱: تغییرات دیتابیس Supabase

**فایل:** 

```sql
-- 1. ایجاد جدول notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id BIGINT REFERENCES public.vehicles(vehicle_id),
    title TEXT NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'warning', 'info', 'subscription')),
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. فعال کردن RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. پالیسی‌ها
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Index‌ها
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_vehicle_type ON public.notifications(vehicle_id, type);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- 5. تریگر updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_notifications
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. اضافه کردن ستون reminder_mode به reminder_settings
ALTER TABLE public.reminder_settings 
ADD COLUMN IF NOT EXISTS reminder_mode VARCHAR(20) NOT NULL DEFAULT 'time' 
CHECK (reminder_mode IN ('km', 'time', 'both'));

ALTER TABLE public.reminder_settings 
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 7. فعال کردن Realtime برای notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 8. کامنت‌ها
COMMENT ON TABLE public.notifications IS 'نوتیفیکیشن‌های کاربران برای یادآوری و هشدارها';

-- 9. تابع کمکی برای دریافت خودروهای نیازمند یادآوری
CREATE OR REPLACE FUNCTION public.get_vehicles_for_reminder()
RETURNS TABLE (
    vehicle_id BIGINT,
    user_id UUID,
    model VARCHAR,
    plate_number VARCHAR,
    interval_days INTEGER,
    interval_km INTEGER,
    warning_days_before INTEGER,
    warning_km_before INTEGER,
    reminder_mode VARCHAR,
    is_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.vehicle_id,
        v.user_id,
        v.model,
        v.plate_number,
        rs.interval_days,
        rs.interval_km,
        rs.warning_days_before,
        rs.warning_km_before,
        rs.reminder_mode,
        rs.is_enabled
    FROM public.vehicles v
    JOIN public.reminder_settings rs ON v.vehicle_id = rs.vehicle_id
    WHERE rs.is_enabled = TRUE 
      AND rs.reminder_mode IN ('time', 'both');
END;
$$ LANGUAGE plpgsql;

-- 10. ایجاد جدول تنظیمات تلگرام
CREATE TABLE public.telegram_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chat_id TEXT UNIQUE,
    connection_code TEXT UNIQUE,  -- کد یکتا برای اتصال خودکار
    bot_token TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. فعال کردن RLS برای تلگرام
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own telegram settings" ON public.telegram_settings
    FOR ALL USING (auth.uid() = user_id);

-- 12. Index برای تلگرام
CREATE INDEX idx_telegram_settings_user_id ON public.telegram_settings(user_id);
CREATE INDEX idx_telegram_settings_code ON public.telegram_settings(connection_code);

-- 13. تریگر updated_at برای تلگرام
CREATE TRIGGER set_updated_at_telegram_settings
    BEFORE UPDATE ON public.telegram_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 14. کامنت‌ها
COMMENT ON TABLE public.telegram_settings IS 'تنظیمات اتصال کاربران به ربات تلگرام';
COMMENT ON COLUMN public.telegram_settings.connection_code IS 'کد یکتا برای اتصال خودکار ربات تلگرام';
```

---

---

## 🔄 روش ۱: اتصال خودکار با کد یکتا (پیشنهادی)

این روش به کاربر اجازه می‌دهد با **یک کلیک** به تلگرام متصل شود، بدون نیاز به کپی/پیست کد.

### مزایا:
- ✅ **تجربه کاربری عالی:** فقط یک دکمه + Start
- ✅ **امن:** کد یکتا و یک‌بار مصرف
- ✅ **سریع:** اتصال در کمتر از ۳۰ ثانیه
- ✅ **هوشمند:** اتصال خودکار بعد از Start

### نحوه کار:
1. کاربر دکمه "اتصال" رو می‌زنه
2. سیستم کد یکتا می‌سازه (مثلاً `X7K9P2R5`)
3. لینک نمایش داده می‌شه: `t.me/your_bot?start=X7K9P2R5`
4. کاربر لینک رو باز می‌کنه و Start می‌زنه
5. ربات کد رو دریافت و `chat_id` رو ذخیره می‌کنه
6. ✅ اتصال کامل شد!

---

### مرحله ۱.۵: اضافه کردن پشتیبانی تلگرام به سرویس

قبل از مرحله ۲، باید فایل‌های پیکربندی Python رو آپدیت کنیم:

**فایل: `requirements.txt` (آپدیت شده)**
```
supabase==2.4.0
schedule==1.2.0
python-dotenv==1.0.0
requests==2.31.0
```

**فایل: `.env.example` (آپدیت شده)**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_TIME=08:00
TELEGRAM_BOT_TOKEN=your-telegram-bot-token  # اختیاری - برای فعال‌سازی تلگرام
TELEGRAM_BOT_USERNAME=your_bot_username    # اختیاری - نام کاربری ربات
```

---

### مرحله ۲: کد Python برای Cron Job (با پشتیبانی تلگرام)

**ساختار پوشه:**

```
reminder-service/
├── main.py
├── requirements.txt
├── .env.example
└── Dockerfile (اختیاری)
```

**فایل: `main.py`**

```python
import os
from supabase import create_client, Client
from datetime import datetime, timedelta
import schedule
import time
import logging
<<<<<<< HEAD
from dotenv import load_dotenv
import sys

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()
=======
import requests
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)

# تنظیمات لاگ
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# بارگذاری و بررسی متغیرهای محیطی
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CRON_TIME = os.environ.get("CRON_TIME", "08:00")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")  # توکن ربات تلگرام

# بررسی وجود متغیرهای ضروری
if not SUPABASE_URL:
    logging.error("❌ خطا: متغیر SUPABASE_URL تنظیم نشده است")
    sys.exit(1)

if not SUPABASE_KEY:
    logging.error("❌ خطا: متغیر SUPABASE_SERVICE_ROLE_KEY تنظیم نشده است")
    sys.exit(1)

# ایجاد کلاینت Supabase
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logging.info("✅ اتصال به Supabase برقرار شد")
except Exception as e:
    logging.error(f"❌ خطا در اتصال به Supabase: {str(e)}")
    sys.exit(1)

def send_telegram_message(chat_id: str, message: str) -> bool:
    """
    ارسال پیام به تلگرام از طریق Bot API
    """
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        logging.warning("توکن تلگرام یا chat_id موجود نیست")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            logging.info(f"✅ پیام تلگرام ارسال شد به {chat_id}")
            return True
        else:
            logging.error(f"❌ خطا در ارسال تلگرام: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logging.error(f"❌ خطا در ارسال تلگرام: {str(e)}")
        return False

def check_time_based_reminders():
    """
    بررسی یادآورهای زمانی و ایجاد نوتیفیکیشن + ارسال تلگرام
    بر اساس تنظیمات متفاوت برای هر خودرو
    """
    logging.info("=" * 50)
    logging.info("شروع بررسی یادآورهای زمانی...")
  
    try:
        # خواندن تمام خودروهای فعال با تنظیمات یادآوری زمانی
        vehicles_response = supabase.rpc('get_vehicles_for_reminder').execute()
    
        if not vehicles_response.data:
            logging.info("هیچ خودرویی برای یادآوری پیدا نشد")
            return
    
        logging.info(f"تعداد {len(vehicles_response.data)} خودرو برای بررسی")
    
        for vehicle in vehicles_response.data:
            try:
                # خواندن آخرین سرویس
                last_service = supabase.table("services") \
                    .select("*") \
                    .eq("vehicle_id", vehicle["vehicle_id"]) \
                    .order("service_date_gregorian", desc=True) \
                    .limit(1) \
                    .execute()
            
                if not last_service.data:
                    logging.warning(f"خودرو {vehicle['model']} - سرویسی ثبت نشده")
                    continue
            
                last_date = datetime.strptime(
                    last_service.data[0]["service_date_gregorian"], 
                    "%Y-%m-%d"
                ).date()
            
                # محاسبه روزهای مانده بر اساس تنظیمات هر خودرو
                days_since_last = (datetime.now().date() - last_date).days
                interval_days = vehicle["interval_days"]  # متفاوت برای هر خودرو
                days_until_due = interval_days - days_since_last
            
                # بررسی آیا در بازه هشدار است؟
                warning_days = vehicle["warning_days_before"]
            
                if 0 < days_until_due <= warning_days:
                    # محاسبه تاریخ موعد برای بررسی دقیق‌تر
                    due_date = last_date + timedelta(days=interval_days)
                    today = datetime.now().date()
                  
                    # بررسی اینکه قبلاً برای این موعد نوتیفیکیشن ارسال نشده باشد
                    # بررسی بر اساس vehicle_id و days_until_due در metadata
                    existing = supabase.table("notifications") \
                        .select("*") \
                        .eq("vehicle_id", vehicle["vehicle_id"]) \
                        .eq("type", "reminder") \
                        .eq("read", False) \
                        .gte("created_at", (datetime.now() - timedelta(days=warning_days + 1)).isoformat()) \
                        .execute()
                
                    # بررسی اینکه آیا نوتیفیکیشن با همان days_until_due وجود دارد
                    notification_exists = False
                    if existing.data:
                        for notif in existing.data:
                            metadata = notif.get("metadata", {})
                            if metadata.get("days_until_due") == days_until_due:
                                notification_exists = True
                                break
                
                    if notification_exists:
                        logging.info(f"✅ نوتیفیکیشن قبلاً ارسال شده: {vehicle['model']} - {days_until_due} روز مانده")
                        continue
                
                    # ایجاد نوتیفیکیشن
                    notification = {
                        "user_id": vehicle["user_id"],
                        "vehicle_id": vehicle["vehicle_id"],
                        "title": "یادآوری سرویس دوره‌ای",
                        "body": f"خودرو {vehicle['model']} ({vehicle['plate_number']}) نیاز به سرویس دوره‌ای دارد. {days_until_due} روز تا موعد ({interval_days} روز) باقی مانده است.",
                        "type": "reminder",
                        "metadata": {
                            "vehicle_model": vehicle["model"],
                            "plate_number": vehicle["plate_number"],
                            "days_until_due": days_until_due,
                            "interval_days": interval_days,
                            "last_service_date": last_service.data[0]["service_date_gregorian"],
                            "due_date": (last_date + timedelta(days=interval_days)).isoformat()
                        }
                    }
                
                    result = supabase.table("notifications").insert(notification).execute()
                
                    if result.data:
                        logging.info(f"✅ نوتیفیکیشن ایجاد شد: {vehicle['model']} - {days_until_due} روز مانده (موعد: {interval_days} روز)")
                        
                        # ارسال به تلگرام (اگر کاربر تنظیم کرده باشد)
                        telegram_settings = supabase.table("telegram_settings") \
                            .select("chat_id") \
                            .eq("user_id", vehicle["user_id"]) \
                            .eq("is_enabled", True) \
                            .limit(1) \
                            .execute()
                        
                        if telegram_settings.data:
                            chat_id = telegram_settings.data[0]["chat_id"]
                            
                            # ساخت پیام زیبا
                            message = f"""
🚨 <b>یادآوری سرویس دوره‌ای خودرو</b> 🚨

🚗 <b>خودرو:</b> {vehicle['model']}
🔢 <b>پلاک:</b> {vehicle['plate_number']}
📅 <b>روزهای باقی‌مانده:</b> {days_until_due} روز
⏱️ <b>موعد اصلی:</b> {interval_days} روز
📝 <b>آخرین سرویس:</b> {last_service.data[0]["service_date_gregorian"]}

⚠️ لطفاً برای سرویس دوره‌ای اقدام کنید!
                            """
                            
                            send_telegram_message(chat_id, message)
                        else:
                            logging.info(f"ℹ️ کاربر {vehicle['user_id']} تنظیمات تلگرام ندارد")
                    else:
                        logging.error(f"❌ خطا در ایجاد نوتیفیکیشن: {vehicle['model']}")
            
            except Exception as e:
                logging.error(f"❌ خطا در پردازش خودرو {vehicle.get('model', 'unknown')}: {str(e)}")
                logging.exception("جزئیات خطا:")
                continue
    
        logging.info("✅ پایان بررسی یادآورها")
        logging.info("=" * 50)
    
    except Exception as e:
        logging.error(f"❌ خطا در دریافت لیست خودروها: {str(e)}")
        logging.exception("جزئیات خطا:")

def main():
    """
    اجرای اصلی برنامه
    """
    logging.info("سرویس یادآوری سرویس دوره‌ای شروع شد...")
    logging.info(f"زمان اجرا: {CRON_TIME}")
<<<<<<< HEAD
  
=======
    logging.info(f"تلگرام ربات: {'✅ فعال' if TELEGRAM_BOT_TOKEN else '❌ غیرفعال'}")
    
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
    # تنظیم Cron Job
    schedule.every().day.at(CRON_TIME).do(check_time_based_reminders)
  
    # اجرای اولیه برای تست
    logging.info("اجرای اولیه برای تست...")
    check_time_based_reminders()
  
    # حلقه اصلی
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
```

---

### مرحله ۲.۵: ربات تلگرام (اختیاری)

**فایل: `bot.py`**
```python
import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from supabase import create_client, Client

# تنظیمات
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    شروع ربات و ذخیره chat_id با استفاده از کد یکتا
    مثال: /start ABC123XYZ
    """
    user = update.effective_user
    chat_id = str(update.effective_chat.id)
    
    # دریافت کد از پارامتر start
    if context.args and len(context.args) > 0:
        connection_code = context.args[0]
        
        # پیدا کردن کاربر با کد یکتا
        result = supabase.table("telegram_settings") \
            .select("user_id") \
            .eq("connection_code", connection_code) \
            .eq("is_enabled", False) \
            .single() \
            .execute()
        
        if result.data:
            user_id = result.data["user_id"]
            
            # ذخیره chat_id و فعال‌سازی
            supabase.table("telegram_settings") \
                .update({
                    "chat_id": chat_id,
                    "is_enabled": True,
                    "connection_code": None  # پاک کردن کد بعد از استفاده
                }) \
                .eq("user_id", user_id) \
                .execute()
            
            logging.info(f"✅ کاربر {user_id} با chat_id {chat_id} متصل شد")
            
            await update.message.reply_text(
                "✅ اتصال با موفقیت انجام شد!\n\n"
                "حالا هر روز یادآوری سرویس دوره‌ای خودرو رو در تلگرام دریافت می‌کنید.\n"
                "می‌توانید از طریق برنامه KhodroBan وضعیت رو مدیریت کنید."
            )
        else:
            await update.message.reply_text(
                "❌ کد نامعتبر یا منقضی شده است.\n\n"
                "لطفاً دوباره در برنامه KhodroBan اقدام کنید:\n"
                "1. به بخش تنظیمات تلگرام بروید\n"
                "2. روی 'اتصال به ربات تلگرام' کلیک کنید\n"
                "3. دکمه Start رو در تلگرام بزنید"
            )
    else:
        # اگر کد ارسال نشده باشد
        await update.message.reply_text(
            "سلام! 👋\n\n"
            "برای اتصال ربات به حساب KhodroBan خود:\n"
            "1. به برنامه KhodroBan بروید\n"
            "2. به بخش تنظیمات تلگرام بروید\n"
            "3. روی 'اتصال به ربات تلگرام' کلیک کنید\n"
            "4. دکمه Start رو بزنید\n\n"
            "اتصال به صورت خودکار انجام می‌شود!"
        )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """نمایش وضعیت اتصال"""
    chat_id = str(update.effective_chat.id)
    
    # پیدا کردن کاربر با chat_id
    result = supabase.table("telegram_settings") \
        .select("user_id, is_enabled") \
        .eq("chat_id", chat_id) \
        .eq("is_enabled", True) \
        .single() \
        .execute()
    
    if result.data:
        await update.message.reply_text(
            "✅ وضعیت اتصال: فعال\n\n"
            f"کاربر: {result.data['user_id']}\n"
            "حالا یادآوری‌ها رو دریافت می‌کنید!"
        )
    else:
        await update.message.reply_text(
            "❌ وضعیت اتصال: غیرفعال\n\n"
            "لطفاً از برنامه KhodroBan مجدداً اقدام کنید."
        )

def main():
    """اجرای ربات"""
    if not BOT_TOKEN:
        logging.error("توکن تلگرام یافت نشد!")
        return
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("status", status))
    
    logging.info("ربات تلگرام در حال اجرا...")
    logging.info("منتظر دستور /start و /status")
    application.run_polling()

if __name__ == "__main__":
    main()
```

---

### مرحله ۳: فایل‌های پیکربندی Python

**فایل: `requirements.txt`**

```
supabase==2.4.0
schedule==1.2.0
python-dotenv==1.0.0
```

**فایل: `.env.example`**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_TIME=08:00
```

**فایل: `Dockerfile` (اختیاری)**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["python", "main.py"]
```

---

### مرحله ۴: تغییرات در فرانت‌اند (SPA)

**فایل جدید: `frontend/src/lib/services/notificationService.ts`**

```typescript
import { supabase } from '../supabase';
import type { Notification } from '$lib/types';

export const notificationService = {
  // خواندن نوتیفیکیشن‌های کاربر
  async getNotifications(userId: string, onlyUnread: boolean = true): Promise<Notification[]> {
    if (!supabase) {
      throw new Error('Supabase client not available. Check VITE_BACKEND_TYPE and environment variables.');
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (onlyUnread) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // علامت‌گذاری به عنوان خوانده‌شده
  async markAsRead(notificationId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not available. Check VITE_BACKEND_TYPE and environment variables.');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // علامت‌گذاری همه به عنوان خوانده‌شده
  async markAllAsRead(userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not available. Check VITE_BACKEND_TYPE and environment variables.');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // گوش دادن به نوتیفیکیشن‌های جدید (Realtime)
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    if (!supabase) {
      console.error('Supabase client not available. Realtime subscription will not work.');
      return null;
    }

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return channel;
  },

  // شمارش نوتیفیکیشن‌های unread
  async getUnreadCount(userId: string): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client not available. Check VITE_BACKEND_TYPE and environment variables.');
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }
};
```

**فایل: `frontend/src/lib/types/index.ts`**

```typescript
export interface Notification {
  id: string;
  user_id: string;
  vehicle_id?: number;
  title: string;
  body: string;
  type: 'reminder' | 'warning' | 'info' | 'subscription';
  read: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface TelegramSettings {
  id: string;
  user_id: string;
  chat_id?: string;
  bot_token?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### مرحله ۴.۵: سرویس تلگرام برای فرانت‌اند

**فایل جدید: `frontend/src/lib/services/telegramService.ts`**
```typescript
import { supabase } from '../supabase';
import type { TelegramSettings } from '$lib/types';

export const telegramService = {
  // ایجاد لینک اتصال خودکار با کد یکتا
  async getTelegramLink(userId: string): Promise<string> {
    // چک کردن اینکه کاربر قبلاً متصل بوده یا نه
    const { data: existing } = await supabase
      .from('telegram_settings')
      .select('chat_id, is_enabled')
      .eq('user_id', userId)
      .single();

    if (existing?.chat_id && existing.is_enabled) {
      return `https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot'}`;
    }

    // ایجاد کد یکتا برای اتصال
    const connectionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // ذخیره کد در دیتابیس
    await supabase
      .from('telegram_settings')
      .upsert({
        user_id: userId,
        connection_code: connectionCode,
        is_enabled: false,
        updated_at: new Date().toISOString()
      });

    // ساخت لینک با کد
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot';
    return `https://t.me/${botUsername}?start=${connectionCode}`;
  },

  // چک کردن وضعیت اتصال
  async checkConnection(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('telegram_settings')
      .select('chat_id, is_enabled')
      .eq('user_id', userId)
      .single();

    return !!data?.chat_id && data.is_enabled;
  },

  // دریافت تنظیمات کامل
  async getSettings(userId: string): Promise<TelegramSettings | null> {
    const { data } = await supabase
      .from('telegram_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  },

  // فعال/غیرفعال کردن تلگرام
  async toggleTelegram(userId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('telegram_settings')
      .upsert({
        user_id: userId,
        is_enabled: enabled,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // ذخیره chat_id (بعد از اتصال موفق)
  async saveChatId(userId: string, chatId: string): Promise<void> {
    const { error } = await supabase
      .from('telegram_settings')
      .upsert({
        user_id: userId,
        chat_id: chatId,
        is_enabled: true,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // حذف اتصال
  async disconnect(userId: string): Promise<void> {
    const { error } = await supabase
      .from('telegram_settings')
      .update({ 
        is_enabled: false, 
        chat_id: null,
        connection_code: null 
      })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // بررسی وضعیت اتصال برای نمایش در UI
  async getConnectionStatus(userId: string): Promise<{
    isConnected: boolean;
    hasCode: boolean;
    chatId?: string;
    code?: string;
  }> {
    const { data } = await supabase
      .from('telegram_settings')
      .select('chat_id, connection_code, is_enabled')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return { isConnected: false, hasCode: false };
    }

    return {
      isConnected: !!data.chat_id && data.is_enabled,
      hasCode: !!data.connection_code,
      chatId: data.chat_id || undefined,
      code: data.connection_code || undefined
    };
  }
};
```

---

### مرحله ۵: تغییرات UI (کامپوننت نوتیفیکیشن و تلگرام)

**فایل جدید: `frontend/src/lib/components/organisms/NotificationBell.svelte`**

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { notificationService } from '$lib/services/notificationService';
  import { authStore, currentUser } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { writable } from 'svelte/store';
  import type { Notification } from '$lib/types';

  let notifications = writable<Notification[]>([]);
  let unreadCount = writable(0);
  let isOpen = $state(false);
  let realtimeChannel: any = null;

  onMount(async () => {
    const user = $currentUser;
  
    if (user?.id) {
      await loadNotifications(user.id);
  
      realtimeChannel = notificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          notifications.update(list => [newNotification, ...list]);
          unreadCount.update(c => c + 1);
          showToast(newNotification.title, newNotification.body);
        }
      );
    }
  });

  onDestroy(() => {
    if (realtimeChannel && supabase) {
      supabase.removeChannel(realtimeChannel);
    }
  });

  async function loadNotifications(userId: string) {
    try {
      const data = await notificationService.getNotifications(userId, true);
      notifications.set(data);
  
      const count = await notificationService.getUnreadCount(userId);
      unreadCount.set(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  async function markAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      notifications.update(list => list.filter(n => n.id !== id));
      unreadCount.update(c => Math.max(0, c - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async function markAllAsRead() {
    const user = $currentUser;
    if (!user?.id) return;
  
    try {
      await notificationService.markAllAsRead(user.id);
      notifications.set([]);
      unreadCount.set(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  function showToast(title: string, body: string) {
    // در صورت استفاده از toast system می‌توانید از toastStore استفاده کنید
    // یا یک toast component جداگانه بسازید
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <strong>${title}</strong>
      <p>${body}</p>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  $: user = $currentUser;
  $: userId = user?.id;
</script>

<div class="notification-bell">
  <button on:click={() => isOpen = !isOpen} class="bell-btn">
    🔔
    {#if $unreadCount > 0}
      <span class="badge">{$unreadCount}</span>
    {/if}
  </button>

  {#if isOpen}
    <div class="notification-dropdown">
      <div class="header">
        <h3>نوتیفیکیشن‌ها</h3>
        <button on:click={markAllAsRead}>همه خوانده شد</button>
      </div>
  
      <div class="list">
        {#if $notifications.length === 0}
          <p class="empty">نوتیفیکیشن جدیدی وجود ندارد</p>
        {:else}
          {#each $notifications as notification}
            <div class="notification-item" on:click={() => markAsRead(notification.id)}>
              <strong>{notification.title}</strong>
              <p>{notification.body}</p>
              <small>{new Date(notification.created_at).toLocaleString('fa-IR')}</small>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-bell { position: relative; }
  .bell-btn { position: relative; font-size: 1.5rem; background: none; border: none; cursor: pointer; }
  .badge { position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
  .notification-dropdown { position: absolute; top: 100%; right: 0; width: 350px; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; }
  .header { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
  .list { max-height: 400px; overflow-y: auto; }
  .notification-item { padding: 12px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
  .notification-item:hover { background: #f9f9f9; }
  .empty { padding: 20px; text-align: center; color: #999; }
</style>
```

**استفاده در داشبورد:**

```svelte
<!-- frontend/src/routes/dashboard/+page.svelte -->
<script>
  import NotificationBell from '$lib/components/organisms/NotificationBell.svelte';
  import TelegramSettings from '$lib/components/organisms/TelegramSettings.svelte';
</script>

<div class="dashboard">
  <header>
    <h1>داشبورد</h1>
    <div class="header-actions">
      <NotificationBell />
    </div>
  </header>
  
  <main>
    <!-- بقیه محتوای داشبورد -->
    
    <!-- بخش تنظیمات تلگرام -->
    <section class="settings-section">
      <TelegramSettings />
    </section>
  </main>
</div>
```

**فایل جدید: `frontend/src/lib/components/organisms/TelegramSettings.svelte`**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { telegramService } from '$lib/services/telegramService';
  import { userStore } from '$lib/stores/auth';

  let isConnected = false;
  let isLoading = true;
  let telegramLink = '';
  let connectionCode = '';
  let error: string | null = null;
  let showCopyButton = false;

  onMount(async () => {
    if ($userStore) {
      await loadSettings();
    }
  });

  async function loadSettings() {
    if (!$userStore) return;
    
    try {
      isLoading = true;
      const status = await telegramService.getConnectionStatus($userStore.id);
      
      isConnected = status.isConnected;
      
      if (!status.isConnected) {
        telegramLink = await telegramService.getTelegramLink($userStore.id);
        connectionCode = status.code || '';
        showCopyButton = !!status.code;
      }
      
      error = null;
    } catch (err) {
      error = 'خطا در بارگذاری تنظیمات';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  async function disconnect() {
    if (!$userStore) return;
    
    try {
      await telegramService.disconnect($userStore.id);
      isConnected = false;
      telegramLink = await telegramService.getTelegramLink($userStore.id);
      showCopyButton = false;
      connectionCode = '';
      error = null;
    } catch (err) {
      error = 'خطا در قطع اتصال';
      console.error(err);
    }
  }

  async function reconnect() {
    if (!$userStore) return;
    
    try {
      // ایجاد کد جدید
      telegramLink = await telegramService.getTelegramLink($userStore.id);
      
      // بارگذاری مجدد برای گرفتن کد
      const status = await telegramService.getConnectionStatus($userStore.id);
      connectionCode = status.code || '';
      showCopyButton = !!status.code;
      
      error = null;
    } catch (err) {
      error = 'خطا در اتصال مجدد';
      console.error(err);
    }
  }

  function copyCode() {
    if (connectionCode) {
      navigator.clipboard.writeText(connectionCode);
      // نمایش پیام موقت
      const btn = document.querySelector('.copy-btn') as HTMLElement;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ کپی شد!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    }
  }
</script>

<div class="telegram-settings">
  <h3>🔔 اتصال به تلگرام</h3>
  <p class="description">
    با اتصال به تلگرام، یادآوری سرویس دوره‌ای خودروها مستقیماً برای شما ارسال می‌شود.
  </p>

  {#if isLoading}
    <div class="loading">در حال بارگذاری...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if isConnected}
    <div class="connected">
      <div class="status-badge connected">✅ متصل</div>
      <p>ربات تلگرام فعال است و یادآوری‌ها را دریافت می‌کنید.</p>
      <div class="actions">
        <button on:click={disconnect} class="btn btn-danger">
          قطع اتصال
        </button>
        <a href="https://t.me/{import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot'}" 
           target="_blank" 
           class="btn btn-secondary">
          مشاهده ربات
        </a>
      </div>
    </div>
  {:else}
    <div class="disconnected">
      <div class="status-badge disconnected">❌ غیرمتصل</div>
      
      <div class="connect-steps">
        <div class="step">
          <span class="step-number">۱</span>
          <span>روی دکمه زیر کلیک کنید</span>
        </div>
        <div class="step">
          <span class="step-number">۲</span>
          <span>در تلگرام، دکمه Start رو بزنید</span>
        </div>
        <div class="step">
          <span class="step-number">۳</span>
          <span>اتصال به صورت خودکار انجام می‌شود</span>
        </div>
      </div>

      <a href={telegramLink} target="_blank" class="btn btn-primary">
        اتصال به ربات تلگرام
      </a>

      {#if showCopyButton && connectionCode}
        <div class="code-section">
          <p class="code-label">کد یکتای شما:</p>
          <div class="code-box">
            <code>{connectionCode}</code>
            <button on:click={copyCode} class="btn copy-btn">
              کپی کد
            </button>
          </div>
          <small>اگر لینک کار نکرد، این کد رو در ربات ارسال کنید</small>
        </div>
      {/if}
      
      <button on:click={reconnect} class="btn btn-secondary">
        دریافت لینک جدید
      </button>
    </div>
  {/if}

  <div class="info-box">
    <strong>💡 نکته:</strong>
    <ul>
      <li>یادآوری‌ها ۷ روز قبل از موعد ارسال می‌شوند</li>
      <li>اتصال خودکار انجام می‌شود، فقط دکمه Start رو بزنید</li>
      <li>می‌توانید همزمان نوتیفیکیشن درون‌برنامه‌ای هم دریافت کنید</li>
    </ul>
  </div>
</div>

<style>
  .telegram-settings {
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: linear-gradient(135deg, #f9f9ff 0%, #f0f4ff 100%);
    max-width: 600px;
  }

  h3 {
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }

  .description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 16px;
  }

  .loading, .error {
    padding: 12px;
    text-align: center;
    border-radius: 6px;
    margin: 8px 0;
  }

  .loading {
    background: #e3f2fd;
    color: #1976d2;
  }

  .error {
    background: #ffebee;
    color: #c62828;
  }

  .connected, .disconnected {
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .status-badge.connected {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .status-badge.disconnected {
    background: #ffebee;
    color: #c62828;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #0088cc;
    color: white;
    width: 100%;
    margin: 8px 0;
  }

  .btn-primary:hover {
    background: #006699;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #5a6268;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background: #c82333;
  }

  .copy-btn {
    background: #28a745;
    color: white;
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .copy-btn:hover {
    background: #218838;
  }

  .connect-steps {
    background: white;
    padding: 12px;
    border-radius: 6px;
    margin: 12px 0;
    border: 1px dashed #ccc;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 0;
    font-size: 0.9rem;
  }

  .step-number {
    background: #0088cc;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .code-section {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    margin: 12px 0;
    border: 1px solid #dee2e6;
  }

  .code-label {
    margin: 0 0 6px 0;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .code-box {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }

  .code-box code {
    background: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid #ced4da;
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: bold;
    color: #0088cc;
    flex: 1;
  }

  .code-section small {
    color: #666;
    font-size: 0.8rem;
  }

  .info-box {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    padding: 12px;
    margin-top: 12px;
    font-size: 0.85rem;
  }

  .info-box ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }

  .info-box li {
    margin: 4px 0;
  }
</style>
```

---

### مرحله ۶: استقرار در چابکان

**الف) ایجاد سرویس Python:**

1. وارد پنل چابکان شوید
2. به بخش **هاست ابری (PaaS)** بروید
3. روی **ایجاد سرویس جدید** کلیک کنید
4. انتخاب: **Python**
5. تنظیمات:
   - نام: `reminder-service`
   - منبع: آپلود فایل‌های Python
   - متغیرهای محیطی: از `.env` استفاده کنید

**ب) تنظیم Cron Job در چابکان:**

- در بخش **Cron Jobs** پنل چابکان
- ایجاد Cron جدید:
  - زمان: `0 8 * * *` (هر روز ساعت ۸ صبح)
  - دستور: `python main.py`
  - مسیر: پوشه سرویس

**ج) استقرار ربات تلگرام (اختیاری):**
1. می‌توانید ربات رو روی سرور خودتون اجرا کنید
2. یا از سرویس‌های رایگان مثل PythonAnywhere استفاده کنید
3. یا از Render.com برای استقرار رایگان استفاده کنید

**د) متغیرهای محیطی مورد نیاز:**
```bash
# برای سرویس Python
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_TIME=08:00
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=your_bot_username

# برای فرانت‌اند
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## ✅ نتیجه نهایی

**وقتی همه مراحل اجرا شود:**

1. **هر روز ساعت ۸ صبح:**

   - Python Cron Job اجرا می‌شود
   - خودروهایی که در بازه هشدار هستند را پیدا می‌کند
   - بر اساس `interval_days` هر خودرو محاسبه می‌کند
   - در جدول `notifications` رکورد ایجاد می‌کند
<<<<<<< HEAD
=======
   - **اگر کاربر تلگرام فعال داشته باشد، پیام هم ارسال می‌شود**

>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
2. **بلافاصله:**

   - کاربر در داشبورد نوتیفیکیشن را می‌بیند (Realtime)
   - **اگر تلگرام فعال باشد، پیام در تلگرام هم دریافت می‌کند**
   - می‌تواند روی آن کلیک کند و جزئیات را ببیند
3. **مزایا:**

   - ✅ خودکار و بدون نیاز به دستی
   - ✅ Realtime (بدون رفرش صفحه)
   - ✅ **چندکاناله:** نوتیفیکیشن + تلگرام
   - ✅ قابل تنظیم توسط کاربر
   - ✅ هر خودرو تنظیمات مخصوص خود را دارد
   - ✅ سرویس‌های فعلی دست نمی‌خورند
   - ✅ **قابلیت انتخاب کانال توسط کاربر**

---

## 📦 فایل‌های مورد نیاز

### در پروژه اصلی:

```
<<<<<<< HEAD
OilChenger/
├── supabase/migrations/004_notifications.sql
=======
KhodroBan/
├── supabase/migrations/002_notifications.sql
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
└── frontend/src/
    ├── lib/services/
    │   ├── notificationService.ts
    │   └── telegramService.ts
    ├── lib/types/index.ts
    └── lib/components/organisms/
        ├── NotificationBell.svelte
        └── TelegramSettings.svelte
```

<<<<<<< HEAD
### سرویس جدید (جداگانه):

=======
### سرویس Python (جداگانه):
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
```
reminder-service/
├── main.py          # با پشتیبانی تلگرام
├── bot.py           # ربات تلگرام (اختیاری)
├── requirements.txt # با requests
├── .env.example     # با متغیرهای تلگرام
└── Dockerfile
```

---

## 🔧 دستورالعمل اجرا

### ۱. اجرای دیتابیس:

```bash
# در Supabase SQL Editor اجرا کنید
# یا از CLI استفاده کنید
supabase migration up
```

### ۲. اجرای سرویس Python (لوکال):

```bash
cd reminder-service

# نصب dependencies
pip install -r requirements.txt

# کپی کردن فایل .env.example به .env و پر کردن مقادیر
cp .env.example .env
# سپس .env را ویرایش کنید و SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY را تنظیم کنید

# اجرای سرویس
python main.py
```

<<<<<<< HEAD
**نکته مهم:**

- برای تست، می‌توانید `CRON_TIME` را به زمان فعلی تنظیم کنید (مثلاً 2 دقیقه دیگر)
- برای production، از cron واقعی سیستم‌عامل استفاده کنید یا از scheduler سرویس cloud استفاده کنید

### ۳. استقرار در چابکان:

- فایل‌ها را آپلود کنید
- متغیرهای محیطی را تنظیم کنید
=======
### ۳. اجرای ربات تلگرام (اختیاری):
```bash
# در ترمینال جداگانه
cd reminder-service
python bot.py
```

### ۴. استقرار در چابکان:
- فایل‌های Python را آپلود کنید
- متغیرهای محیطی را تنظیم کنید (مخصوصاً `TELEGRAM_BOT_TOKEN`)
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
- Cron Job را فعال کنید
- **نکته:** ربات تلگرام می‌تواند روی همان سرور یا سرور جداگانه اجرا شود

### ۵. تنظیم فرانت‌اند:
```bash
cd frontend
npm install
# در .env فایل:
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## 📞 پشتیبانی تلگرام

### راه‌اندازی ربات:
1. به `@BotFather` در تلگرام پیام بدید
2. دستور `/newbot` رو بزنید
3. نام و یوزرنیم ربات رو انتخاب کنید (مثلاً `KhodroBanReminderBot`)
4. توکن ربات رو دریافت کنید
5. توکن رو در `.env` فایل سرویس Python قرار بدید:
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   TELEGRAM_BOT_USERNAME=KhodroBanReminderBot
   ```

### 🔄 اتصال خودکار کاربر (روش ۱):

**مراحل کامل:**

1. **کاربر در فرانت‌اند:**
   - به داشبورد می‌رود
   - به بخش **تنظیمات تلگرام** می‌رود
   - روی **"اتصال به ربات تلگرام"** کلیک می‌کند

2. **سیستم به صورت خودکار:**
   - یک **کد یکتا** (مثلاً `X7K9P2R5`) ایجاد می‌کند
   - کد رو در جدول `telegram_settings` ذخیره می‌کند
   - لینک اتصال رو نمایش می‌دهد: `t.me/KhodroBanReminderBot?start=X7K9P2R5`

3. **کاربر در تلگرام:**
   - روی لینک کلیک می‌کند
   - دکمه **Start** رو می‌زند
   - **ربات به صورت خودکار** کد رو دریافت می‌کنه

4. **ربات:**
   - کد رو با دیتابیس چک می‌کنه
   - `chat_id` کاربر رو با `user_id` مچ می‌کنه
   - اتصال رو فعال می‌کنه
   - پیام تأیید می‌فرسته

5. **نتیجه:**
   - ✅ کاربر متصل شده
   - ✅ یادآوری‌ها از این به بعد به تلگرام هم ارسال می‌شود

### 📋 دستورات ربات:

**`/start <code>`** - اتصال با کد یکتا
```
/start X7K9P2R5
```

**`/status`** - بررسی وضعیت اتصال
```
/status
```

### تست ارسال پیام:
```bash
# ۱. اجرای ربات
cd reminder-service
python bot.py

# ۲. در تلگرام به ربات پیام بدید
# ۳. دستور /status رو بزنید
# ۴. باید وضعیت رو نشون بده
```

### 🎯 گردش کار کامل:

```
کاربر در KhodroBan
    ↓
کلیک روی "اتصال به تلگرام"
    ↓
سیستم کد یکتا می‌سازه (X7K9P2R5)
    ↓
ذخیره در دیتابیس (telegram_settings)
    ↓
نمایش لینک: t.me/your_bot?start=X7K9P2R5
    ↓
کاربر روی لینک کلیک + Start
    ↓
ربات کد رو دریافت می‌کنه
    ↓
ربات چک می‌کنه: کد معتبره؟
    ↓
بله → ذخیره chat_id + فعال‌سازی
    ↓
ارسال پیام تأیید به کاربر
    ↓
✅ اتصال کامل شد!
```

---

## ⚠️ نکات مهم

### ۱. امنیت:
- ✅ توکن تلگرام فقط در سرور Python (نه فرانت‌اند)
- ✅ `chat_id` با RLS محافظت می‌شود
- ✅ کد یکتا فقط یک‌بار قابل استفاده است
- ✅ کد بعد از استفاده پاک می‌شود

### ۲. هزینه:
- ✅ ارسال پیام تلگرام **رایگان** است
- ✅ محدودیت: ۳۰ پیام/ثانیه (کافیه)
- ✅ نیازی به سرور جداگانه نیست (می‌تونه روی همون سرور باشه)

### ۳. خطاهای رایج:
- ❌ **کد نامعتبر:** کاربر کد رو اشتباه وارد کرده
- ❌ **کد منقضی:** کد بیشتر از ۲۴ ساعت استفاده نشده
- ❌ **ربات اجرا نشده:** باید `python bot.py` در حال اجرا باشه

### ۴. تست:
```bash
# تست کامل اتصال:
# ۱. اجرای ربات
python bot.py

# ۲. در تلگرام به ربات پیام بدید
# ۳. دستور /status رو بزنید
# ۴. باید "غیرمتصل" نشون بده

# ۴. در فرانت‌اند، دکمه اتصال رو بزنید
# ۵. لینک رو باز کنید و Start بزنید
# ۶. دوباره /status بزنید → باید "متصل" نشون بده
```

### ۵. گردش کار توسعه:
```
لوکال توسعه:
    ↓
python bot.py (در ترمینال ۱)
    ↓
npm run dev (در ترمینال ۲)
    ↓
تست اتصال
    ↓
استقرار در چابکان
```

---

## 🎯 خلاصه روش ۱ (اتصال خودکار)

**مزایا:**
- ✅ **سریع:** فقط یک دکمه + Start
- ✅ **ساده:** نیازی به کپی/پیست کد نیست
- ✅ **امن:** کد یکتا و یک‌بار مصرف
- ✅ **هوشمند:** اتصال خودکار بعد از Start

**معایب:**
- ⚠️ نیاز به اجرای ربات در زمان اتصال
- ⚠️ کد بعد از ۲۴ ساعت منقضی می‌شه (نیاز به Refresh)

**نتیجه:** بهترین روش برای MVP! 🚀

---

## 📞 پشتیبانی و عیب‌یابی

<<<<<<< HEAD
در صورت بروز مشکل:

1. **لاگ‌های Python:** بررسی لاگ‌ها برای خطاهای اتصال به Supabase یا پردازش داده
2. **دیتابیس:** بررسی جدول `notifications` در Supabase Dashboard
3. **فرانت‌اند:** کنسول مرورگر برای خطاهای Realtime یا Supabase
4. **RLS Policies:** اطمینان از اینکه پالیسی‌های RLS به درستی تنظیم شده‌اند
5. **Service Role Key:** اطمینان از استفاده از Service Role Key (نه anon key) در Python
6. **Realtime:** بررسی فعال بودن Realtime برای جدول `notifications` در Supabase Dashboard

### مشکلات رایج:

**مشکل:** Python نمی‌تواند به Supabase متصل شود

- **راه‌حل:** بررسی `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` در `.env`

**مشکل:** نوتیفیکیشن در فرانت‌اند نمایش داده نمی‌شود

- **راه‌حل:** بررسی اتصال Realtime در Supabase Dashboard → Replication

**مشکل:** RLS Policy خطا می‌دهد

- **راه‌حل:** برای Python باید از Service Role Key استفاده شود که RLS را دور می‌زند

---

## ⚠️ نکات مهم

1. **Service Role Key:** هرگز Service Role Key را در frontend استفاده نکنید! فقط در backend/Python
2. **Cron Job:** در production از cron واقعی سیستم‌عامل استفاده کنید، نه `schedule` library
3. **Migration:** قبل از اجرای migration در production، یک backup از دیتابیس بگیرید
4. **Performance:** Index‌های اضافه شده برای بهبود کارایی در query‌های بزرگ ضروری هستند
5. **Error Handling:** کد Python با error handling کامل نوشته شده تا در صورت خطا crash نکند

---

**تاریخ آخرین بروزرسانی:** ۲۷ دی ۱۴۰۴
**وضعیت:** ✅ آماده پیاده‌سازی
**نکته کلیدی:** هر خودرو `interval_days` مخصوص خود را دارد که از جدول `reminder_settings` خوانده می‌شود
=======
### خطاهای رایج:

**۱. خطای تلگرام:**
- لاگ‌های Python رو چک کنید
- مطمئن شوید `TELEGRAM_BOT_TOKEN` درسته
- ربات رو در تلگرام `@BotFather` چک کنید

**۲. نوتیفیکیشن دریافت نمی‌شود:**
- جدول `notifications` در Supabase رو ببینید
- لاگ‌های Cron Job رو چک کنید
- مطمئن شوید `reminder_settings` فعاله

**۳. تلگرام کار نمی‌کنه:**
- ربات باید اول در تلگرام اجرا بشه
- کاربر باید دکمه Start رو بزنه
- `chat_id` باید در دیتابیس ذخیره بشه

### لاگ‌گیری:
```bash
# لاگ‌های Python
tail -f reminder-service.log

# لاگ‌های Supabase
در پنل Supabase > Database > SQL Editor
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

# لاگ‌های ربات تلگرام
# در ترمینالی که bot.py اجرا شده، خروجی رو ببینید
```

---

## 🧪 تست کامل سیستم

### تست ۱: اتصال تلگرام

**مراحل:**
1. **اجرای ربات:**
   ```bash
   cd reminder-service
   python bot.py
   ```

2. **در فرانت‌اند:**
   - لاگین کنید
   - به داشبورد برید
   - بخش تنظیمات تلگرام
   - کلیک روی "اتصال به ربات تلگرام"

3. **در تلگرام:**
   - لینک رو باز کنید
   - دکمه **Start** رو بزنید
   - پیام تأیید رو دریافت کنید

4. **چک کردن:**
   ```sql
   -- در Supabase SQL Editor
   SELECT * FROM telegram_settings WHERE user_id = 'your-user-id';
   -- باید chat_id پر شده باشد
   ```

### تست ۲: ارسال یادآوری

**مراحل:**
1. **اضافه کردن خودرو:**
   - در فرانت‌اند یک خودرو اضافه کنید
   - تنظیمات یادآوری: ۳۰ روز، هشدار ۷ روز قبل

2. **اضافه کردن سرویس:**
   - تاریخ سرویس: ۲۵ روز پیش
   - (یعنی ۵ روز تا موعد، در بازه هشدار)

3. **اجرای Cron Job:**
   ```bash
   python main.py
   ```

4. **چک کردن:**
   - ✅ نوتیفیکیشن در داشبورد
   - ✅ پیام در تلگرام
   - ✅ لاگ‌ها: "✅ نوتیفیکیشن ایجاد شد"

### تست ۳: جلوگیری از تکرار

**مراحل:**
1. Cron Job رو دوبار اجرا کنید
2. باید لاگ بگه: "✅ نوتیفیکیشن قبلاً ارسال شده"

---

## 📊 گزارش موفقیت

**وقتی همه چیز درسته:**

```
✅ دیتابیس: جدول‌ها ایجاد شدند
✅ ربات: در حال اجرا و پاسخگو
✅ Cron Job: اجرا می‌شود
✅ نوتیفیکیشن: ایجاد می‌شود
✅ تلگرام: پیام ارسال می‌شود
✅ فرانت‌اند: Realtime کار می‌کند
```

**اگر مشکلی بود:**
1. لاگ‌ها رو چک کنید
2. جدول‌ها رو در Supabase ببینید
3. توکن تلگرام رو مطمئن شوید
4. ربات رو در تلگرام `@BotFather` چک کنید

---

---

## 🔧 نکات پیشرفته

### ۱. انقضای کد:
```typescript
// در سرویس فرانت‌اند، می‌تونید کد رو بعد از ۲۴ ساعت منقضی کنید
const EXPIRY_HOURS = 24;

// در ربات، چک کنید کد منقضی نشده باشد
const codeAge = (Date.now() - codeCreatedTime) / (1000 * 60 * 60);
if (codeAge > EXPIRY_HOURS) {
    // کد منقضی شده
}
```

### ۲. ارسال گروهی:
```python
# می‌تونید چند کاربر رو همزمان چک کنید
for user_id in users_needing_reminder:
    # ارسال به هر کاربر
    pass
```

### ۳. Webhook (جایگزین Polling):
```python
# برای استقرار بهتر، می‌تونید از Webhook استفاده کنید
# نیازی به اجرای مداوم Python نیست
```

### ۴. مدیریت خطا:
```python
# اضافه کردن Retry Logic
for attempt in range(3):
    try:
        send_telegram_message(chat_id, message)
        break
    except:
        time.sleep(2)
```

---

## 📦 فایل‌های نهایی مورد نیاز

### پروژه اصلی (KhodroBan):
```
KhodroBan/
├── supabase/migrations/002_notifications.sql  # با connection_code
├── frontend/src/
│   ├── lib/services/
│   │   ├── notificationService.ts
│   │   └── telegramService.ts  # با getTelegramLink خودکار
│   ├── lib/types/index.ts      # با TelegramSettings
│   └── lib/components/organisms/
│       ├── NotificationBell.svelte
│       └── TelegramSettings.svelte  # با کد یکتا
└── frontend/.env
    └── VITE_TELEGRAM_BOT_USERNAME=your_bot
```

### سرویس Python:
```
reminder-service/
├── main.py          # با ارسال تلگرام
├── bot.py           # با /start <code> و /status
├── requirements.txt # supabase, schedule, requests
├── .env.example     # با TELEGRAM_BOT_TOKEN
└── Dockerfile
```

---

## 🎯 خلاصه اجرایی

**برای اجرا:**

1. **SQL:** اجرای `002_notifications.sql`
2. **Python:** 
   ```bash
   pip install -r requirements.txt
   python bot.py      # ترمینال ۱
   python main.py     # ترمینال ۲
   ```
3. **فرانت‌اند:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **تست:**
   - لاگین کنید
   - به تنظیمات تلگرام برید
   - دکمه اتصال رو بزنید
   - لینک رو باز کنید و Start بزنید
   - یادآوری رو تست کنید

---

**تاریخ آخرین بروزرسانی:** ۲۷ دی ۱۴۰۴  
**وضعیت:** ✅ آماده اجرا  
**ویژگی‌ها:** نوتیفیکیشن + تلگرام (اتصال خودکار)  
**نکته کلیدی:** هر خودرو `interval_days` مخصوص خود را دارد
>>>>>>> 8575c66 (feat: add GroupedSelect component for enhanced service and expense category selection)
