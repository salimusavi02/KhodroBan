# سیستم یادآوری سرویس دوره‌ای خودروها با Python

## 📋 اطلاعات کلی

**تاریخ ایجاد:** ۲۷ دی ۱۴۰۴
**نوع پروژه:** Python Cron Job + Supabase + SPA
**هدف:** یادآوری خودکار سرویس دوره‌ای خودروها

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
- **چندکاناله:** ایمیل + نوتیفیکیشن
- **قابل تنظیم:** هر کاربر برای هر خودرو تنظیمات مخصوص دارد

---

## 🏗️ معماری سیستم

```
┌─────────────────────────────────────────────────────────────┐
│  Python Cron Job (چابکان)                                   │
│  - اجرا: هر روز ساعت ۸ صبح                                   │
│  - وظیفه: بررسی یادآورها + ایجاد نوتیفیکیشن                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Supabase (دیتابیس)                                         │
│  - جدول notifications (نوتیفیکیشن‌ها)                       │
│  - جدول reminder_settings (تنظیمات هر خودرو)                │
│  - جدول vehicles + services (اطلاعات خودروها)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SPA فرانت‌اند (SvelteKit)                                   │
│  - Realtime Supabase (نمایش فوری)                           │
│  - notificationService.ts (خواندن نوتیفیکیشن‌ها)           │
│  - UI کامپوننت (نمایش و مدیریت)                             │
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
```

---

### مرحله ۲: کد Python برای Cron Job

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
from dotenv import load_dotenv
import sys

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

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

def check_time_based_reminders():
    """
    بررسی یادآورهای زمانی و ایجاد نوتیفیکیشن
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
```

---

### مرحله ۵: تغییرات UI (کامپوننت نوتیفیکیشن)

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
</script>

<div class="dashboard">
  <header>
    <h1>داشبورد</h1>
    <NotificationBell />
  </header>
  <!-- بقیه محتوا -->
</div>
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

---

## ✅ نتیجه نهایی

**وقتی همه مراحل اجرا شود:**

1. **هر روز ساعت ۸ صبح:**

   - Python Cron Job اجرا می‌شود
   - خودروهایی که در بازه هشدار هستند را پیدا می‌کند
   - بر اساس `interval_days` هر خودرو محاسبه می‌کند
   - در جدول `notifications` رکورد ایجاد می‌کند
2. **بلافاصله:**

   - کاربر در داشبورد نوتیفیکیشن را می‌بیند (Realtime)
   - می‌تواند روی آن کلیک کند و جزئیات را ببیند
3. **مزایا:**

   - ✅ خودکار و بدون نیاز به دستی
   - ✅ Realtime (بدون رفرش صفحه)
   - ✅ قابل تنظیم توسط کاربر
   - ✅ هر خودرو تنظیمات مخصوص خود را دارد
   - ✅ سرویس‌های فعلی دست نمی‌خورند

---

## 📦 فایل‌های مورد نیاز

### در پروژه اصلی:

```
OilChenger/
├── supabase/migrations/004_notifications.sql
└── frontend/src/
    ├── lib/services/notificationService.ts
    ├── lib/types/index.ts
    └── lib/components/organisms/NotificationBell.svelte
```

### سرویس جدید (جداگانه):

```
reminder-service/
├── main.py
├── requirements.txt
├── .env.example
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

**نکته مهم:**

- برای تست، می‌توانید `CRON_TIME` را به زمان فعلی تنظیم کنید (مثلاً 2 دقیقه دیگر)
- برای production، از cron واقعی سیستم‌عامل استفاده کنید یا از scheduler سرویس cloud استفاده کنید

### ۳. استقرار در چابکان:

- فایل‌ها را آپلود کنید
- متغیرهای محیطی را تنظیم کنید
- Cron Job را فعال کنید

---

## 📞 پشتیبانی و عیب‌یابی

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
