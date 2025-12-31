# مستند فنی خودروبان (KhodroBan)

## ۱. نمای کلی برنامه

**خودروبان (KhodroBan)** یک اپلیکیشن مدیریت خودرو است که به کاربران اجازه می‌دهد:
- خودروهای خود را مدیریت کنند
- سرویس‌های دوره‌ای را ثبت و پیگیری کنند
- هزینه‌های روزانه را ثبت کنند
- یادآورهای هوشمند برای سرویس‌های دوره‌ای دریافت کنند
- گزارش‌های مالی و سرویس تولید کنند

**ویژگی‌های کلیدی:**
- طراحی واکنش‌گرا (Mobile-First)
- پشتیبانی از چند زبان (فارسی، انگلیسی، عربی)
- سیستم یادآوری هوشمند
- مدیریت هزینه‌ها و سرویس‌ها
- گزارش‌گیری پیشرفته
- مدل Freemium (رایگان و Pro)

## ۲. ساختار پروژه

```
KhodroBan/
├── 📄 README.md                          # معرفی کلی پروژه
│
├── 📂 docs/                              # مستندات پروژه
│   ├── 📂 product/                       # مستندات محصول
│   ├── 📂 strategy/                      # استراتژی و برنامه‌ریزی
│   ├── 📂 research/                      # تحقیقات بازار
│   ├── 📂 tutorials/                     # آموزش‌ها
│   └── 📂 technical/                     # مستندات فنی
│       ├── backend-setup.md
│       ├── frontend-setup.md
│       ├── api/                          # مستندات API
│       ├── database/                     # طراحی دیتابیس
│       └── RECONSTRUCTION_GUIDE.md       # این فایل
│
├── 📂 backend/                           # Backend API (Django)
│   ├── 📂 src/                          # کدهای اصلی
│   ├── 📂 tests/                        # تست‌ها
│   └── README.md                        # راهنمای Backend
│
├── 📂 frontend/                          # Frontend Web App (Vite + Svelte)
│   ├── 📂 src/                          # کدهای اصلی
│   ├── 📂 public/                       # فایل‌های استاتیک
│   └── README.md                        # راهنمای Frontend
│
├── 📂 scripts/                           # اسکریپت‌های کمکی
│
├── 📂 reminder-service/                  # سرویس یادآوری (Python Cron)
│
└── 📂 supabase/                          # تنظیمات Supabase
    ├── 📂 migrations/                    # مایگریشن‌های دیتابیس
    └── config.toml                       # تنظیمات Supabase
```

## ۳. معماری فنی

### ۳.۱ الگوی معماری

**معماری اصلی: Service-Based Architecture با State Management**

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer (Svelte)                     │
│  Components → Pages → Stores → Services → API/Supabase      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  Services (Auth, Vehicle, Service, Expense, Reminder, etc.) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  Supabase (PostgreSQL) / Django REST API / Mock             │
└─────────────────────────────────────────────────────────────┘
```

### ۳.۲ جریان داده

**جریان اطلاعات در برنامه:**

1. **User Input** → **Component** → **Store Update** → **Service Call** → **API/DB**
2. **DB Change** → **Supabase Realtime** → **Store Update** → **UI Re-render**
3. **Cron Job** → **Backend Logic** → **Notification Table** → **Realtime** → **UI**

### ۳.۳ مدیریت وضعیت (State Management)

**استفاده از Svelte Stores:**

```typescript
// مثال: ساختار Store
interface StoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

interface StoreActions {
  setItems(items: DataType[]): void;
  addItem(item: DataType): void;
  updateItem(id: string, data: Partial<DataType>): void;
  deleteItem(id: string): void;
}
```

**لیست Stores:**
- `authStore`: وضعیت احراز هویت کاربر
- `vehiclesStore`: لیست خودروها و خودروی انتخابی
- `servicesStore`: رکوردهای سرویس
- `expensesStore`: رکوردهای هزینه
- `remindersStore`: یادآورها و تنظیمات
- `toastStore`: نوتیفیکیشن‌های UI
- `uiStore`: وضعیت‌های UI (loading, modal, etc.)

## ۴. تکنولوژی‌ها و فریمورک‌ها

### ۴.۱ فریمورک‌های اصلی

| تکنولوژی | نسخه | نقش |
|---------|------|-----|
| **SvelteKit** | 2.0.0 | فریمورک اصلی Frontend |
| **Vite** | 5.4.0 | Build tool و Dev server |
| **TypeScript** | 5.6.0 | زبان برنامه‌نویسی |
| **Supabase** | 2.89.0 | Backend-as-a-Service |
| **Django** | 4.2.x | Backend (placeholder) |
| **PostgreSQL** | 15.x | دیتابیس اصلی |

### ۴.۲ کتابخانه‌های کلیدی

**State & Data:**
- `axios`: HTTP client برای API calls
- `svelte-i18n`: بین‌المللی‌سازی (fa, en, ar)

**UI & Components:**
- `chart.js`: نمودارهای گزارش
- `persian-date`: تبدیل تاریخ شمسی

**Testing:**
- `vitest`: Unit testing
- `@testing-library/svelte`: Component testing

**Development:**
- `eslint`: Linting
- `prettier`: Code formatting
- `husky`: Git hooks

### ۴.۳ ابزارهای توسعه

- **Cursor**: IDE اصلی توسعه
- **Supabase Studio**: مدیریت دیتابیس
- **GitHub**: کنترل نسخه
- **Netlify/Deno**: Deployment

## ۵. ویژگی‌های اصلی برنامه

### ۵.۱ احراز هویت (Authentication)

**پیاده‌سازی:**
- **Supabase Auth**: لاگین/ثبت‌نام با ایمیل/رمز
- **Google OAuth**: ورود با حساب Google
- **Session Persistence**: ذخیره در localStorage
- **Route Guard**: محافظت از صفحات خصوصی

**جریان:**
1. User لاگین می‌کند → Token در localStorage ذخیره می‌شود
2. در `+layout.svelte` → Token بازیابی می‌شود
3. `authStore` آپدیت می‌شود → UI ری‌رندر می‌شود
4. در صورت نیاز → `authService.getProfile()` برای بازیابی اطلاعات کاربر

### ۵.۲ مدیریت خودروها (Vehicles)

**ویژگی‌ها:**
- افزودن/ویرایش/حذف خودرو
- ثبت کیلومتر فعلی
- نمایش وضعیت سرویس (عادی، نزدیک موعد، گذشته)
- محدودیت تعداد برای کاربران رایگان (۳ خودرو)

**اعتبارسنجی فرم:**
- مدل: required, minLength(2), maxLength(50)
- سال: required, min(1350), max(1405)
- پلاک: required, pattern (فرمت خاص)
- کیلومتر: required, positiveNumber

### ۵.۳ سرویس‌ها (Services)

**ویژگی‌ها:**
- ثبت سرویس‌های دوره‌ای (روغن، فیلتر، ترمز، ...)
- تاریخ شمسی و میلادی
- کیلومتر و هزینه
- یادداشت‌های تکمیلی

**دسته‌بندی سرویس‌ها:**
- تعویض روغن
- فیلتر هوا
- فیلتر روغن
- لنت ترمز
- شمع
- دیسک و صفحه
- سرویس کامل
- سایر

### ۵.۴ هزینه‌ها (Expenses)

**ویژگی‌ها:**
- ثبت هزینه‌های روزانه
- دسته‌بندی‌های مختلف
- ارتباط با کیلومتر
- یادداشت‌های تکمیلی

**دسته‌بندی هزینه‌ها:**
- سوخت (بنزین، گاز، ...)
- کارواش
- پارکینگ
- عوارض
- جریمه
- بیمه
- تعمیرات
- سایر

### ۵.۵ یادآورها (Reminders)

**ویژگی‌ها:**
- یادآوری خودکار بر اساس کیلومتر (هر ۵۰۰۰ کیلومتر)
- یادآوری خودکار بر اساس زمان (هر ۳ ماه)
- هشدار ۷ روز قبل از موعد
- دسته‌بندی وضعیت: عادی، نزدیک، گذشته، بسته شده

**جریان یادآوری خودکار:**
1. **Cron Job** (Python) → هر روز اجرا می‌شود
2. بررسی خودروها → محاسبه زمان/کیلومتر باقی‌مانده
3. ایجاد نوتیفیکیشن در جدول `reminder_logs`
4. **Supabase Realtime** → ارسال به Frontend
5. **UI** → نمایش در داشبورد و Bell Notification

### ۵.۶ گزارش‌ها (Reports)

**ویژگی‌ها:**
- خلاصه هزینه‌ها (کل، سرویس، سایر)
- هزینه به تفکیک دسته‌بندی
- روند ماهانه (خطی)
- خروجی CSV (همه کاربران)
- خروجی PDF (فقط Pro)

## ۶. مدل‌های داده

### ۶.۱ ساختار دیتابیس (PostgreSQL - Supabase)

**جدول `user_profiles`:**
```sql
user_id (PK, uuid) → auth.users.id
first_name: text
last_name: text
tier: enum('free', 'pro') = 'free'
created_at: timestamp
updated_at: timestamp
```

**جدول `vehicles`:**
```sql
vehicle_id (PK, serial)
user_id (FK → user_profiles.user_id)
model: text
plate_number: text
year: integer
current_km: integer
note: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**جدول `services`:**
```sql
service_id (PK, serial)
vehicle_id (FK → vehicles.vehicle_id)
service_date: date (Gregorian)
service_date_gregorian: text (for display)
service_km: integer
cost: integer
service_type: enum(...)
description: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**جدول `daily_expenses`:**
```sql
expense_id (PK, serial)
vehicle_id (FK → vehicles.vehicle_id)
expense_date: date (Gregorian)
expense_date_gregorian: text (for display)
amount: integer
category: enum(...)
km_at_expense: integer (nullable)
description: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**جدول `reminder_settings`:**
```sql
user_id (PK, FK → user_profiles.user_id)
km_interval: integer = 5000
time_interval_months: integer = 3
alert_days_before: integer = 7
channels: jsonb = ['inApp']
created_at: timestamp
updated_at: timestamp
```

**جدول `reminder_logs`:**
```sql
log_id (PK, serial)
user_id (FK → user_profiles.user_id)
vehicle_id (FK → vehicles.vehicle_id, nullable)
title: text
message: text
category: enum('oil_change', 'filter', 'brakes', ...)
status: enum('ok', 'near', 'overdue')
due_date: date (nullable)
due_km: integer (nullable)
warning_days_before: integer
source: enum('manual', 'auto')
dismissed: boolean = false
read: boolean = false
created_at: timestamp
updated_at: timestamp
```

**جدول `notifications`:**
```sql
id (PK, uuid)
user_id (FK → user_profiles.user_id)
vehicle_id (FK → vehicles.vehicle_id, nullable)
title: text
body: text
type: enum('reminder', 'warning', 'info', 'subscription')
read: boolean = false
metadata: jsonb
created_at: timestamp
updated_at: timestamp
```

### ۶.۲ روابط بین مدل‌ها

```
user_profiles (1) ── (*) vehicles
vehicles (1) ── (*) services
vehicles (1) ── (*) daily_expenses
vehicles (1) ── (*) reminder_logs
user_profiles (1) ── (*) reminder_settings
user_profiles (1) ── (*) reminder_logs
user_profiles (1) ── (*) notifications
```

**Rules:**
- `ON DELETE CASCADE` برای vehicles, services, expenses
- `ON DELETE RESTRICT` برای user_profiles (جلوگیری از حذب اشتباه)

### ۶.۳ Triggers و Functions

**trigger `handle_updated_at`:**
```sql
-- به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- اعمال برای تمام جداول
```

**trigger `handle_new_user`:**
```sql
-- ایجاد پروفایل و تنظیمات پیش‌فرض برای کاربر جدید
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
    
    INSERT INTO reminder_settings (user_id)
    VALUES (NEW.id);
    
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 1, 'active'); -- Free plan
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## ۷. API و ارتباطات سرور

### ۷.۱ معماری Service Router

**فایل: `frontend/src/lib/services/base/router.ts`**

```typescript
export function selectService<T>(
  mockService: T,
  supabaseService: T,
  djangoService?: T
): T {
  switch (BACKEND_TYPE) {
    case 'mock':
      return mockService;
    case 'supabase':
      return supabaseService;
    case 'django':
      return djangoService || supabaseService;
    default:
      return supabaseService;
  }
}
```

**نحوه استفاده:**
```typescript
// در هر service
export const vehicleService = selectService(
  vehicleServiceMock,
  vehicleServiceSupabase,
  vehicleServiceDjango
);
```

### ۷.۲ ساختار Service ها

**هر Service شامل:**
- **Mock Implementation**: برای تست بدون backend
- **Supabase Implementation**: برای استفاده با Supabase
- **Django Implementation**: برای استفاده با Django API

**متدهای مشترک:**
- `getAll(vehicleId?)`: دریافت همه یا فیلتر شده
- `getById(id)`: دریافت یک آیتم
- `create(data)`: ایجاد آیتم جدید
- `update(id, data)`: به‌روزرسانی آیتم
- `delete(id)`: حذف آیتم

### ۷.۳ Supabase Integration

**پیکربندی:**
```typescript
// frontend/src/lib/supabase.ts
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: browser ? window.localStorage : undefined,
      storageKey: 'khodroban-auth-token',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-client-info': 'khodroban-frontend',
      },
    },
  }
);
```

**Realtime Subscription:**
```typescript
// مثال: اشتراک برای نوتیفیکیشن‌ها
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Update UI
      notifications.update(list => [payload.new, ...list]);
    }
  )
  .subscribe();
```

### ۷.۴ API Error Handling

**فایل: `frontend/src/lib/services/api.ts`**

```typescript
// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401: Unauthorized → Logout
    if (error.response?.status === 401) {
      authStore.logout();
      toastStore.error('نشست شما منقضی شده است');
    }
    
    // 403: Forbidden → Pro feature
    if (error.response?.status === 403) {
      toastStore.warning('این قابلیت برای کاربران Pro در دسترس است');
    }
    
    // Network Error
    if (!error.response) {
      toastStore.error('خطا در اتصال به سرور');
    }
    
    return Promise.reject(error);
  }
);
```

### ۷.۵ نقاط پایانی API (Django)

**Auth:**
- `POST /api/auth/register/` - ثبت‌نام
- `POST /api/auth/login/` - لاگین
- `GET /api/auth/profile/` - پروفایل کاربر
- `PATCH /api/auth/profile/` - به‌روزرسانی پروفایل
- `POST /api/auth/google/` - ورود با Google

**Vehicles:**
- `GET /api/vehicles/` - لیست خودروها
- `POST /api/vehicles/` - افزودن خودرو
- `GET /api/vehicles/{id}/` - جزئیات خودرو
- `PATCH /api/vehicles/{id}/` - ویرایش خودرو
- `DELETE /api/vehicles/{id}/` - حذف خودرو
- `PATCH /api/vehicles/{id}/km/` - به‌روزرسانی کیلومتر

**Services:**
- `GET /api/services/` - لیست سرویس‌ها
- `POST /api/services/` - ثبت سرویس
- `GET /api/services/{id}/` - جزئیات سرویس
- `PATCH /api/services/{id}/` - ویرایش سرویس
- `DELETE /api/services/{id}/` - حذف سرویس
- `GET /api/services/latest/{vehicle_id}/` - آخرین سرویس

**Expenses:**
- `GET /api/expenses/` - لیست هزینه‌ها
- `POST /api/expenses/` - ثبت هزینه
- `GET /api/expenses/{id}/` - جزئیات هزینه
- `PATCH /api/expenses/{id}/` - ویرایش هزینه
- `DELETE /api/expenses/{id}/` - حذف هزینه

**Reminders:**
- `GET /api/reminders/` - لیست یادآورها
- `POST /api/reminders/` - ایجاد یادآور
- `GET /api/reminders/{id}/` - جزئیات یادآور
- `PATCH /api/reminders/{id}/` - ویرایش یادآور
- `DELETE /api/reminders/{id}/` - حذف یادآور
- `PATCH /api/reminders/{id}/dismiss/` - بستن یادآور
- `GET /api/reminders/settings/` - تنظیمات یادآور
- `PATCH /api/reminders/settings/` - به‌روزرسانی تنظیمات

**Reports:**
- `GET /api/reports/summary/` - خلاصه گزارش
- `GET /api/reports/export/csv/` - خروجی CSV
- `GET /api/reports/export/pdf/` - خروجی PDF
- `GET /api/reports/trend/monthly/` - روند ماهانه

**Notifications:**
- `GET /api/notifications/` - لیست نوتیفیکیشن‌ها
- `PATCH /api/notifications/{id}/read/` - علامت‌گذاری خوانده شده
- `PATCH /api/notifications/read-all/` - خواندن همه
- `DELETE /api/notifications/{id}/` - حذف نوتیفیکیشن

## ۸. رابط کاربری و تجربه کاربری

### ۸.۱ ساختار صفحات و کامپوننت‌ها

**ساختار کلی:**
```
Layout (Header + Sidebar + BottomNav)
├── +layout.svelte (Global: i18n, Auth Guard, Toast)
│
├── Auth Pages
│   ├── /login (+page.svelte)
│   ├── /register (+page.svelte)
│
├── Dashboard Pages
│   ├── / (+page.svelte) → /dashboard
│   ├── /vehicles (+page.svelte)
│   ├── /vehicles/[id] (+page.svelte)
│   ├── /add (+page.svelte)
│   ├── /reminders (+page.svelte)
│   ├── /reports (+page.svelte)
│   └── /settings (+page.svelte)
```

**Atomic Design Components:**
```
src/lib/components/
├── ui/ (Atoms & Molecules)
│   ├── Button.svelte
│   ├── Input.svelte
│   ├── Select.svelte
│   ├── GroupedSelect.svelte
│   ├── Textarea.svelte
│   ├── Card.svelte
│   ├── Badge.svelte
│   ├── Modal.svelte
│   ├── Tabs.svelte
│   ├── Toast.svelte
│   ├── Spinner.svelte
│   ├── EmptyState.svelte
│   └── LanguageSwitcher.svelte
│
├── layout/ (Organisms)
│   ├── Layout.svelte
│   ├── Header.svelte
│   ├── Sidebar.svelte
│   ├── BottomNav.svelte
│
├── features/ (Molecules/Organisms)
│   ├── LoginForm.svelte
│   ├── SocialLoginButtons.svelte
│   ├── AuthWelcome.svelte
│
├── organisms/ (Complex Components)
│   ├── ReminderModal.svelte
│   ├── NotificationBell.svelte
│   └── VehicleModal.svelte
```

### ۸.۲ جزئیات صفحات

#### صفحه ۱: داشبورد (/dashboard)

**توضیح صفحه:**
صفحه اصلی برنامه که خلاصه‌ای از وضعیت خودروها، یادآورهای فعال و دسترسی سریع را نمایش می‌دهد.

**مسیر دسترسی:** `/` یا `/dashboard`

**کامپوننت اصلی:** `src/routes/dashboard/+page.svelte`

**فیلدها و عناصر:**
- **بخش یادآورها:**
  - لیست یادآورهای فعال (عنوان، پیام، وضعیت)
  - دکمه ایجاد یادآور (🔗 `/add?tab=service`)
  - Badge برای تعداد یادآورها

- **بخش خودروها:**
  - کارت هر خودرو (مدل، پلاک، کیلومتر)
  - Badge وضعیت (عادی، نزدیک موعد، گذشته)
  - لینک به جزئیات خودرو (🔗 `/vehicles/{id}`)

- **بخش دسترسی سریع:**
  - دکمه ثبت سرویس (🔗 `/add?tab=service`)
  - دکمه ثبت هزینه (🔗 `/add?tab=expense`)
  - دکمه گزارش‌ها (🔗 `/reports`)
  - دکمه افزودن خودرو (🔗 `/vehicles`)

**جریان کار:**
1. User وارد داشبورد می‌شود
2. `onMount` → فراخوانی `vehicleService.getAll()` و `reminderService.getAll()`
3. داده‌ها در `vehiclesStore` و `remindersStore` ذخیره می‌شود
4. UI بر اساس Stores ری‌رندر می‌شود
5. Polling هر ۶۰ ثانیه برای یادآورها

**اعتبارسنجی:**
- نیاز به احراز هویت (Route Guard در `+layout.svelte`)

---

#### صفحه ۲: خودروها (/vehicles)

**توضیح صفحه:**
لیست تمام خودروهای کاربر با قابلیت افزودن، ویرایش و حذف.

**مسیر دسترسی:** `/vehicles`

**کامپوننت اصلی:** `src/routes/vehicles/+page.svelte`

**فیلدها و عناصر:**
- **Header:**
  - عنوان: "خودروهای من"
  - دکمه افزودن خودرو (بازکردن Modal)

- **لیست خودروها:**
  - کارت هر خودرو شامل:
    - مدل (مثال: پژو ۲۰۶)
    - پلاک (مثال: ۱۲ب۳۴۵-۷۸)
    - سال ساخت (مثال: ۱۳۹۸)
    - کیلومتر فعلی (مثال: ۸۵,۰۰۰)
    - وضعیت سرویس (Badge)
  - دکمه‌های عملیات:
    - ویرایش (✏️)
    - حذف (🗑️)
    - مشاهده جزئیات (🔗)

- **محدودیت نسخه رایگان:**
  - نمایش اطلاعیه اگر به محدودیت رسیده باشد
  - لینک ارتقا به Pro

**Modal افزودن/ویرایش خودرو:**
- **فیلدها:**
  - مدل خودرو (متن، الزامی، ۲-۵۰ کاراکتر)
  - سال ساخت (عدد، الزامی، ۱۳۵۰-۱۴۰۵)
  - شماره پلاک (متن، الزامی، فرمت خاص)
  - کیلومتر فعلی (عدد، الزامی، >= 0)
  - یادداشت (متن، اختیاری)

**جریان کار:**
1. User روی دکمه "افزودن خودرو" کلیک می‌کند
2. Modal باز می‌شود → فرم نمایش داده می‌شود
3. User داده‌ها را وارد می‌کند → Validate می‌شود
4. Submit → `vehicleService.create()`
5. `vehiclesStore.addVehicle()` → UI آپدیت می‌شود
6. Modal بسته می‌شود → Toast نمایش داده می‌شود

**اعتبارسنجی:**
- مدل: `required`, `minLength(2)`, `maxLength(50)`
- سال: `required`, `min(1350)`, `max(1405)`, `year`
- پلاک: `required`, `plateNumber`
- کیلومتر: `required`, `kilometers`

---

#### صفحه ۳: جزئیات خودرو (/vehicles/[id])

**توضیح صفحه:**
نمایش جزئیات کامل یک خودرو شامل سرویس‌ها و هزینه‌ها.

**مسیر دسترسی:** `/vehicles/{id}`

**کامپوننت اصلی:** `src/routes/vehicles/[id]/+page.svelte`

**فیلدها و عناصر:**
- **اطلاعات خودرو:**
  - مدل، پلاک، سال
  - کیلومتر فعلی (با دکمه به‌روزرسانی)
  - هزینه کل سرویس‌ها
  - هزینه کل هزینه‌ها
  - یادداشت (اگر وجود دارد)

- **دسترسی سریع:**
  - دکمه ثبت سرویس (🔗 `/add?tab=service&vehicle={id}`)
  - دکمه ثبت هزینه (🔗 `/add?tab=expense&vehicle={id}`)

- **تب‌ها:**
  - **سرویس‌ها:** لیست سرویس‌های ثبت شده
  - **هزینه‌ها:** لیست هزینه‌های ثبت شده

- **رکوردها (هر تب):**
  - تاریخ
  - نوع/دسته‌بندی
  - مبلغ/هزینه
  - کیلومتر (اگر وجود دارد)
  - یادداشت (اگر وجود دارد)

**Modal به‌روزرسانی کیلومتر:**
- فیلد: کیلومتر جدید (عدد، الزامی، >= 0)
- دکمه: ذخیره

**جریان کار:**
1. User وارد صفحه می‌شود → `loadVehicleData(id)` فراخوانی می‌شود
2. `Promise.all([vehicleService.getById(), serviceService.getAll(), expenseService.getAll()])`
3. داده‌ها در state ذخیره می‌شود
4. User روی "به‌روزرسانی کیلومتر" کلیک می‌کند
5. Modal باز می‌شود → کیلومتر جدید وارد می‌شود
6. `vehicleService.updateKm()` → Store آپدیت می‌شود
7. Toast نمایش داده می‌شود

---

#### صفحه ۴: ثبت جدید (/add)

**توضیح صفحه:**
فرم دوگانه برای ثبت سرویس یا هزینه.

**مسیر دسترسی:** `/add`

**کامپوننت اصلی:** `src/routes/add/+page.svelte`

**تب‌ها:**
- **ثبت سرویس** (🔧)
- **ثبت هزینه** (💰)

**فرم سرویس:**
- **فیلدها:**
  - خودرو (Select، الزامی)
  - تاریخ (متن، الزامی، فرمت ۱۴۰۳/۰۹/۱۵)
  - کیلومتر (عدد، الزامی، >= 0)
  - هزینه (عدد، الزامی، >= 0)
  - نوع سرویس (GroupedSelect، الزامی)
  - یادداشت (متن، اختیاری)

- **دکمه‌ها:**
  - انصراف (بازگشت)
  - ثبت سرویس
  - ایجاد یادآور (اگر کیلومتر و خودرو انتخاب شده باشد)

**فرم هزینه:**
- **فیلدها:**
  - خودرو (Select، الزامی)
  - تاریخ (متن، الزامی)
  - مبلغ (عدد، الزامی، >= 0)
  - دسته‌بندی (GroupedSelect، الزامی)
  - کیلومتر (عدد، اختیاری، >= 0)
  - یادداشت (متن، اختیاری)

- **دکمه‌ها:**
  - انصراف (بازگشت)
  - ثبت هزینه

**جریان کار (ثبت سرویس):**
1. User تب "ثبت سرویس" را انتخاب می‌کند
2. فرم نمایش داده می‌شود → خودروها بارگذاری می‌شوند
3. User داده‌ها را وارد می‌کند → Validate می‌شود
4. Submit → `serviceService.create()`
5. اگر کیلومتر جدید > کیلومتر فعلی خودرو → `vehicleService.updateKm()`
6. `servicesStore.addService()` و `vehiclesStore.updateKilometers()`
7. **Open Reminder Modal** با داده‌های پیش‌فرض:
   - عنوان: "سرویس بعدی [نوع] [مدل]"
   - کیلومتر: سرویس + ۵۰۰۰
   - تاریخ: سرویس + ۳ ماه
8. User می‌تواند یادآور ایجاد کند یا رد کند
9. Redirect به داشبورد

**جریان کار (ثبت هزینه):**
1. User تب "ثبت هزینه" را انتخاب می‌کند
2. فرم نمایش داده می‌شود
3. User داده‌ها را وارد می‌کند → Validate می‌شود
4. Submit → `expenseService.create()`
5. اگر کیلومتر وارد شده و > کیلومتر فعلی → `vehicleService.updateKm()`
6. `expensesStore.addExpense()` و `vehiclesStore.updateKilometers()`
7. Toast نمایش داده می‌شود
8. Redirect به داشبورد

**اعتبارسنجی:**
- **سرویس:** vehicleId, date, km, cost, type (همه الزامی)
- **هزینه:** vehicleId, date, amount, category (همه الزامی)

---

#### صفحه ۵: یادآورها (/reminders)

**توضیح صفحه:**
مدیریت کامل یادآورها با فیلتر و دسته‌بندی.

**مسیر دسترسی:** `/reminders`

**کامپوننت اصلی:** `src/routes/reminders/+page.svelte`

**فیلدها و عناصر:**
- **Header:**
  - عنوان: "یادآورها"
  - دکمه ایجاد یادآور جدید

- **فیلترها:**
  - دکمه‌های دسته‌بندی: فعال (X)، همه (Y)، بسته شده (Z)
  - جستجو (متن)
  - فیلتر خودرو (Select)
  - فیلتر تاریخ (Select: این هفته، این ماه، ماه آینده)
  - دکمه پاک کردن فیلترها

- **دسته‌بندی‌ها:**
  - **⚠️ یادآورهای گذشته** (Overdue)
  - **🔔 یادآورهای نزدیک** (Near)
  - **✅ یادآورهای عادی** (OK)
  - **✅ یادآورهای بسته شده** (Dismissed)

- **کارت یادآور (در هر دسته):**
  - آیکون دسته‌بندی
  - عنوان و توضیحات
  - پیام وضعیت
  - نام خودرو (اگر مرتبط باشد)
  - اطلاعات زمانی/کیلومتری
  - نوار پیشرفت (Progress Bar)
  - دکمه‌ها: بستن (✅)، ویرایش (✏️)، حذف (🗑️)

**Modal ایجاد/ویرایش یادآور:**
- **فیلدها:**
  - عنوان (متن، الزامی)
  - توضیحات (متن، اختیاری)
  - خودرو (Select، اختیاری)
  - تاریخ موعد (متن، اختیاری)
  - کیلومتر موعد (عدد، اختیاری)
  - روزهای قبل از موعد (عدد، پیش‌فرض ۷)

**جریان کار:**
1. User وارد صفحه می‌شود → `loadReminders()` فراخوانی می‌شود
2. داده‌ها در `remindersStore` ذخیره می‌شود
3. فیلترهای پیش‌فرض اعمال می‌شود (فقط فعال)
4. User فیلترها را تغییر می‌دهد → لیت فیلتر می‌شود
5. User روی "ایجاد یادآور" کلیک می‌کند → Modal باز می‌شود
6. فرم پر می‌شود → Validate می‌شود
7. Submit → `reminderService.create()`
8. `remindersStore.addReminder()` → UI آپدیت می‌شود
9. User روی "بستن" کلیک می‌کند → `reminderService.dismiss()`
10. `remindersStore.dismissReminder()` → از لیت حذف می‌شود

---

#### صفحه ۶: گزارش‌ها (/reports)

**توضیح صفحه:**
نمایش گزارش‌های مالی و سرویس.

**مسیر دسترسی:** `/reports`

**کامپوننت اصلی:** `src/routes/reports/+page.svelte`

**فیلدها و عناصر:**
- **فیلترها:**
  - خودرو (Select: همه خودروها یا یک خودرو)

- **کارت‌های خلاصه:**
  - مجموع هزینه‌ها (💰)
  - هزینه سرویس (🔧) + تعداد
  - سایر هزینه‌ها (🧾) + تعداد

- **هزینه به تفکیک دسته‌بندی:**
  - لیست دسته‌بندی‌ها با آیکون و مبلغ

- **روند ماهانه:**
  - نمودار خطی (Bar) با ماه و مبلغ

- **خروجی گرفتن:**
  - دکمه دانلود CSV (همه)
  - دکمه دانلود PDF (فقط Pro)

**جریان کار:**
1. User وارد صفحه می‌شود → `loadData()` فراخوانی می‌شود
2. خودروها بارگذاری می‌شود → Select پر می‌شود
3. `reportService.getSummary()` → خلاصه بارگذاری می‌شود
4. User فیلتر خودرو را تغییر می‌دهد → `loadSummary()` دوباره فراخوانی می‌شود
5. User روی "دانلود CSV" کلیک می‌کند:
   - `reportService.exportCSV()` → Blob دریافت می‌شود
   - `reportService.downloadFile()` → دانلود شروع می‌شود
6. User روی "دانلود PDF" کلیک می‌کند:
   - Check Pro status
   - `reportService.exportPDF()` → Blob دریافت می‌شود
   - دانلود شروع می‌شود

---

#### صفحه ۷: تنظیمات (/settings)

**توضیح صفحه:**
مدیریت پروفایل، تنظیمات یادآور و ارتقا.

**مسیر دسترسی:** `/settings`

**کامپوننت اصلی:** `src/routes/settings/+page.svelte`

**بخش‌های صفحه:**

**الف) پروفایل:**
- آواتار (👤)
- نام (Input، قابل ویرایش)
- ایمیل (Input، غیرقابل ویرایش)
- Tier (Badge: Pro یا رایگان)
- دکمه ذخیره تغییرات

**ب) تنظیمات یادآور:**
- فاصله کیلومتری سرویس (عدد، پیش‌فرض ۵۰۰۰)
- فاصله زمانی سرویس (ماه، پیش‌فرض ۳)
- روزهای قبل از موعد (عدد، پیش‌فرض ۷)
- کانال‌های یادآوری:
  - In-App (همیشه فعال)
  - SMS (فقط Pro)
- دکمه ذخیره تنظیمات

**ج) ارتقا به Pro:**
- لیست مزایا:
  - خودروهای نامحدود
  - همگام‌سازی ابری
  - خروجی PDF
  - یادآور پیامکی
  - گزارش‌های پیشرفته
- دکمه ارتقا

**د) اطلاعات برنامه:**
- لوگو (🚗)
- نام برنامه
- نسخه (۱.۰.۰)

**ه) خروج:**
- دکمه خروج از حساب

**جریان کار:**
1. User وارد صفحه می‌شود → `loadSettings()` فراخوانی می‌شود
2. پروفایل و تنظیمات بارگذاری می‌شود
3. User نام را تغییر می‌دهد → `authService.updateProfile()`
4. User تنظیمات را تغییر می‌دهد → `reminderService.updateSettings()`
5. User روی SMS کلیک می‌کند → Check Pro → اگر نیست Toast
6. User روی ارتقا کلیک می‌کند → `authService.upgradeToPro()` → Redirect (دمو)
7. User روی خروج کلیک می‌کند → Confirm → `authStore.logout()` → Redirect

---

#### صفحه ۸: لاگین (/login)

**توضیح صفحه:**
ورود کاربر به برنامه.

**مسیر دسترسی:** `/login`

**کامپوننت اصلی:** `src/routes/login/+page.svelte`

**فیلدها و عناصر:**
- **Header:**
  - لوگو (🚗)
  - عنوان: "خودروبان"
  - زیرعنوان: "مدیریت هوشمند نگهداری خودرو"

- **فرم لاگین:**
  - ایمیل (Email، الزامی)
  - رمز عبور (Password، الزامی)
  - فراموشی رمز (Link)
  - دکمه ورود

- **Social Login:**
  - دکمه ورود با Google

- **Footer:**
  - "حساب کاربری ندارید؟"
  - لینک ثبت‌نام

**جریان کار:**
1. User ایمیل و رمز را وارد می‌کند
2. Validate می‌شود
3. Submit → `authService.login()`
4. `authStore.loginSuccess(user, token)` → ذخیره در localStorage
5. Toast خوش‌آمدگویی
6. Redirect به `/dashboard`

**ورود با Google:**
1. User روی دکمه Google کلیک می‌کند
2. `authService.loginWithGoogle()`
3. Redirect به Google Auth
4. بازگشت با کد → تبادل توکن
5. `authStore.loginSuccess()`
6. Redirect به داشبورد

---

#### صفحه ۹: ثبت‌نام (/register)

**توضیح صفحه:**
ایجاد حساب کاربری جدید.

**مسیر دسترسی:** `/register`

**کامپوننت اصلی:** `src/routes/register/+page.svelte`

**فیلدها و عناصر:**
- **Header:**
  - لوگو (🚗)
  - عنوان: "ثبت‌نام در خودروبان"
  - زیرعنوان: "حساب کاربری خود را بسازید"

- **فرم ثبت‌نام:**
  - نام (متن، الزامی)
  - ایمیل (Email، الزامی)
  - رمز عبور (Password، الزامی، حداقل ۶ کاراکتر)
  - تکرار رمز عبور (Password، الزامی، باید برابر باشد)
  - دکمه ثبت‌نام

- **Footer:**
  - "قبلاً ثبت‌نام کرده‌اید؟"
  - لینک ورود

**جریان کار:**
1. User داده‌ها را وارد می‌کند
2. Validate می‌شود (مخصوصاً تطابق رمزها)
3. Submit → `authService.register({name, email, password})`
4. `authStore.loginSuccess(user, token)`
5. Toast موفقیت
6. Redirect به `/dashboard`

**اعتبارسنجی:**
- نام: `required`
- ایمیل: `required`, `email`
- رمز: `required`, `password` (حداقل ۶ کاراکتر)
- تکرار رمز: `required`, `passwordMatch`

---

#### صفحه ۱۰: فراموشی رمز (/forgot-password)

**توضیح صفحه:**
بازیابی رمز عبور (در کد موجود نیست، اما لینک در لاگین وجود دارد).

**مسیر دسترسی:** `/forgot-password`

**وضعیت:** Placeholder (در کد فعلی فقط لینک دارد، پیاده‌سازی نشده)

---

### ۸.۳ کامپوننت‌های قابل استفاده مجدد

**۱. Button (`src/lib/components/ui/Button.svelte`)**
- **Props:** variant, size, type, disabled, loading, fullWidth, icon
- **Variants:** primary, secondary, success, danger, ghost
- **Sizes:** sm, md, lg
- **Features:** Loading state, Icon support, Event dispatch

**۲. Input (`src/lib/components/ui/Input.svelte`)**
- **Props:** type, name, value, placeholder, label, error, hint, disabled, required, icon, min, max
- **Features:** Two-way binding, Error display, Icon, Hint text

**۳. Select (`src/lib/components/ui/Select.svelte`)**
- **Props:** name, value, options, placeholder, label, error, disabled, required
- **Features:** Two-way binding, Error display, Array of options

**۴. GroupedSelect (`src/lib/components/ui/GroupedSelect.svelte`)**
- **Props:** groups, label, placeholder, value, error, required
- **Features:** Modal-based selection, Search, Group tabs, Mobile responsive

**۵. Card (`src/lib/components/ui/Card.svelte`)**
- **Props:** title, subtitle, padding, variant, hoverable, clickable
- **Variants:** default, solid, outline
- **Padding:** none, sm, md, lg
- **Features:** Slots for content and footer

**۶. Modal (`src/lib/components/ui/Modal.svelte`)**
- **Props:** open, title, size, closeOnBackdrop, showClose
- **Sizes:** sm, md, lg, full
- **Features:** Animations, Escape key, Backdrop click, Body scroll lock

**۷. Toast (`src/lib/components/ui/Toast.svelte`)**
- **Props:** message, type, duration
- **Types:** success, error, warning, info
- **Features:** Auto-dismiss, Animations, Icons

**۸. Tabs (`src/lib/components/ui/Tabs.svelte`)**
- **Props:** tabs, activeTab
- **Features:** Event dispatch, Icon support, Active state

**۹. Badge (`src/lib/components/ui/Badge.svelte`)**
- **Props:** variant, size, icon
- **Variants:** default, success, warning, danger, primary
- **Sizes:** sm, md

**۱۰. EmptyState (`src/lib/components/ui/EmptyState.svelte`)**
- **Props:** icon, title, description
- **Features:** Slot for actions

**۱۱. Spinner (`src/lib/components/ui/LoadingSpinner.svelte`)**
- **Props:** message, size
- **Sizes:** sm, md, lg
- **Features:** Reduced motion support

**۱۲. NotificationBell (`src/lib/components/organisms/NotificationBell.svelte`)**
- **Features:** Realtime updates, Dropdown, Mark as read, Delete, Mock mode toggle

---

### ۸.۴ الگوهای طراحی

**۱. Mobile-First Responsive Design:**
- CSS Grid و Flexbox
- Media queries: 480px, 768px, 1024px
- Fluid typography و spacing

**۲. Glassmorphism:**
- `backdrop-filter: blur()`
- `rgba()` backgrounds
- Border transparency

**۳. Atomic Design:**
- Atoms: Button, Input, Badge
- Molecules: Form fields, Card
- Organisms: Modal, Notification Bell
- Templates: Layout
- Pages: Routes

**۴. Service-Based Architecture:**
- Separation of concerns
- Mock/Supabase/Django implementations
- Router pattern for backend selection

**۵. Store Pattern:**
- Single source of truth
- Derived stores for computed values
- LocalStorage persistence for auth

---

### ۸.۵ تعاملات کاربر و انیمیشن‌ها

**Interaction Patterns:**
1. **Click:** Button hover, active states
2. **Form:** Validation on blur, real-time feedback
3. **Modal:** Open/close with animations
4. **Toast:** Slide-in, auto-dismiss
5. **Dropdown:** Slide-down, click outside
6. **Tabs:** Smooth transition
7. **Loading:** Spinner animation
8. **Progress Bar:** Width animation

**Animations (Svelte Transitions):**
- `fade`: Modal backdrop, Toast
- `scale`: Modal content
- `slide`: Dropdown, Notification list
- `fly`: Toast entrance

**User Feedback:**
- **Success:** Green toast with checkmark
- **Error:** Red toast with X
- **Warning:** Yellow toast with !
- **Info:** Blue toast with i
- **Loading:** Spinner + disabled buttons
- **Empty State:** Icon + message + action

---

### ۸.۶ واکنش‌گرایی

**Mobile-First Breakpoints:**

```css
/* Mobile (Default) */
.container {
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Responsive Components:**
- **Header:** Menu button on mobile, Title on all
- **BottomNav:** Visible only on mobile (< 768px)
- **Sidebar:** Toggleable on mobile, Fixed on desktop
- **Modal:** Fullscreen on mobile, Centered on desktop
- **GroupedSelect:** Vertical tabs on mobile, Horizontal on desktop

**Touch Targets:**
- Minimum 44x44px for buttons
- 48px minimum height for list items
- Adequate spacing between interactive elements

## ۹. طراحی بصری و استایل‌دهی

### ۹.۱ تم اصلی و پالت رنگی

**CSS Variables (`src/styles/global.css`):**

```css
:root {
  /* Colors */
  --color-primary: #1e3a8a;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1e3a5f;

  --color-success: #10b981;
  --color-success-light: #34d399;
  --color-success-bg: rgba(16, 185, 129, 0.1);

  --color-warning: #f59e0b;
  --color-warning-light: #fbbf24;
  --color-warning-bg: rgba(245, 158, 11, 0.1);

  --color-danger: #ef4444;
  --color-danger-light: #f87171;
  --color-danger-bg: rgba(239, 68, 68, 0.1);

  --color-bg: #f3f4f6;
  --color-bg-dark: #e5e7eb;
  --color-text: #1f2937;
  --color-text-light: #6b7280;
  --color-text-muted: #9ca3af;

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-bg-solid: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  --glass-blur: blur(10px);
  --glass-radius: 16px;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Typography */
  --font-family: 'Vazirmatn', 'IRANSans', 'Tahoma', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;

  /* Z-index layers */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 600;
}
```

**Color Palette:**
- **Primary:** Blue (#1e3a8a) - Actions, Links
- **Success:** Green (#10b981) - Success states, Active
- **Warning:** Yellow (#f59e0b) - Warnings, Pro features
- **Danger:** Red (#ef4444) - Errors, Delete actions
- **Background:** Light gray (#f3f4f6) - Page background
- **Text:** Dark gray (#1f2937) - Primary text

### ۹.۲ Glassmorphism Effect

**Implementation:**
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
}
```

**Usage:**
- Cards (variant="solid")
- Modals
- Bottom Navigation
- Header
- Dropdowns

### ۹.۳ فونت‌ها و تایپوگرافی

**Font Stack:**
```css
font-family: 'Vazirmatn', 'IRANSans', 'Tahoma', sans-serif;
```

**Font Sizes (Mobile-First):**
- XS: 0.75rem (12px) - Labels, hints
- SM: 0.875rem (14px) - Body text, buttons
- Base: 1rem (16px) - Default
- LG: 1.125rem (18px) - Headings
- XL: 1.25rem (20px) - Titles
- 2XL: 1.5rem (24px) - Main titles
- 3XL: 2rem (32px) - Hero

**Font Weights:**
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

### ۹.۴ کلاس‌های CSS Utility

**Layout:**
- `.page-container` - Padding and max-width
- `.loading-container` - Centered spinner
- `.form` - Flex column with gap
- `.form-actions` - Button alignment

**Text:**
- `.text-primary` - Primary color
- `.text-muted` - Muted text
- `.text-center` - Center alignment

**Spacing:**
- `.gap-sm`, `.gap-md`, `.gap-lg` - Flex/Grid gaps
- `.margin-top-lg` - Top margin

**States:**
- `.disabled` - Opacity and cursor
- `.error` - Error border/color
- `.active` - Active state
- `.hoverable` - Hover effects

## ۱۰. پیکربندی و تنظیمات

### ۱۰.۱ فایل‌های پیکربندی

**۱. `frontend/package.json`**
```json
{
  "name": "khodroban-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev --port 5173",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint .",
    "format": "prettier --write .",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte": "^5.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^4.0.16",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",
    "axios": "^1.7.0",
    "chart.js": "^4.4.0",
    "persian-date": "^1.1.0",
    "svelte-i18n": "^4.0.1"
  }
}
```

**۲. `frontend/vite.config.ts`**
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $components: path.resolve('./src/lib/components'),
      $stores: path.resolve('./src/lib/stores'),
      $services: path.resolve('./src/lib/services'),
      $utils: path.resolve('./src/lib/utils'),
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**۳. `frontend/svelte.config.js`**
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/KhodroBan' : '',
    },
    csrf: {
      checkOrigin: true,
    },
  },
};

export default config;
```

**۴. `frontend/.env.example`**
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend Type: mock | supabase | django
VITE_BACKEND_TYPE=supabase

# Django API (if using django)
VITE_DJANGO_API_URL=http://localhost:8000/api

# GitHub Pages (if deploying)
VITE_REPO_NAME=KhodroBan

# App
VITE_APP_NAME=خودروبان
```

**۵. `frontend/tsconfig.json`**
```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "$lib": ["./src/lib"],
      "$components": ["./src/lib/components"],
      "$stores": ["./src/lib/stores"],
      "$services": ["./src/lib/services"],
      "$utils": ["./src/lib/utils"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules/*", "build/*"]
}
```

**۶. `frontend/.eslintrc.cjs`**
```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:svelte/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
```

**۷. `frontend/.prettierrc`**
```json
{
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

### ۱۰.۲ متغیرهای محیطی

**متغیرهای ضروری:**
- `VITE_SUPABASE_URL`: URL پروژه Supabase
- `VITE_SUPABASE_ANON_KEY`: کلید Anon Supabase
- `VITE_BACKEND_TYPE`: نوع backend (mock/supabase/django)
- `VITE_DJANGO_API_URL`: URL API Django (اختیاری)

**متغیرهای اختیاری:**
- `VITE_REPO_NAME`: برای GitHub Pages
- `VITE_APP_NAME`: نام برنامه

### ۱۰.۳ تنظیمات بیلد و دیپلوی

**GitHub Pages:**
```bash
# 1. Build
npm run build

# 2. Push to gh-pages branch
git subtree push --prefix build origin gh-pages
```

**Netlify:**
```bash
# 1. Connect repository
# 2. Build command: npm run build
# 3. Publish directory: build
# 4. Set environment variables
```

**Deno Deploy:**
```bash
# 1. Install Deno CLI
# 2. Build: npm run build
# 3. Deploy: deno deploy
```

**Docker (Backend):**
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "src.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### ۱۰.۴ پیکربندی ابزارهای توسعه

**Husky (Git Hooks):**
```bash
# .husky/pre-commit
npm run lint
npm run test
```

**Lint-staged:**
```json
{
  "*.{js,ts,svelte}": ["eslint --fix", "prettier --write"]
}
```

## ۱۱. نکات فنی و بهینه‌سازی

### ۱۱.۱ بهترین شیوه‌ها (Best Practices)

**۱. Svelte 5 Runes:**
- استفاده از `$state` به جای `let` برای reactivity
- استفاده از `$derived` برای computed values
- استفاده از `$effect` برای side effects

**۲. TypeScript:**
- تعریف دقیق interfaces برای تمام داده‌ها
- استفاده از generics برای Service ها
- Type safety در API calls

**۳. Component Design:**
- Single Responsibility Principle
- Reusable UI components
- Props validation
- Event dispatching

**۴. Store Pattern:**
- Single source of truth
- Derived stores for complex logic
- Persistence to localStorage for auth

**۵. Service Layer:**
- Separation of concerns
- Mock/Supabase/Django implementations
- Error handling in interceptors

### ۱۱.۲ بهینه‌سازی عملکرد

**۱. Code Splitting:**
- SvelteKit automatically splits routes
- Dynamic imports for heavy libraries

**۲. Lazy Loading:**
```typescript
// Dynamic import
const Chart = await import('chart.js');
```

**۳. Debouncing:**
```typescript
// Search input
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

**۴. Caching:**
- Store data in Svelte stores
- Check store before API call
- Use Supabase cache

**۵. Image Optimization:**
- Use SVG icons (Emojis)
- No heavy images in MVP

**۶. Bundle Size:**
- Tree-shaking with Vite
- Only import what's needed

### ۱۱.۳ ملاحظات امنیتی

**۱. Authentication:**
- Token stored in localStorage (not ideal but simple)
- Supabase handles JWT validation
- Route guards for protected routes

**۲. Authorization:**
- Row Level Security (RLS) in Supabase
- User ID checks in all queries
- `eq('user_id', user.id)` in every call

**۳. Input Validation:**
- Client-side: `validation.ts`
- Server-side: Supabase constraints
- Django: DRF serializers

**۴. XSS Prevention:**
- Svelte auto-escapes content
- No innerHTML usage
- Sanitize user inputs

**۵. CSRF Protection:**
- SvelteKit CSRF enabled
- SameSite cookies

**۶. API Keys:**
- Never commit keys
- Use `.env` files
- Supabase anon key only (safe)

**۷. Rate Limiting:**
- Supabase has built-in limits
- Django: Add django-ratelimit

### ۱۱.۴ مشکلات شناخته شده و راه‌حل‌ها

**۱. Supabase Type Inference:**
```typescript
// Problem: TypeScript errors with dynamic updates
// Solution: Use @ts-ignore for complex queries
// @ts-ignore - Supabase type inference issue
const { data } = await supabase.from('table').update(updates);
```

**۲. Date Conversion:**
```typescript
// Problem: Jalali/Gregorian conversion
// Solution: Use persian-date library
import PersianDate from 'persian-date';
const jalaliDate = new PersianDate().format('YYYY/MM/DD');
```

**۳. GitHub Pages Base Path:**
```typescript
// Problem: Routes don't work with base path
// Solution: Custom navigateTo function
export async function navigateTo(path: string) {
  const basePath = getBasePath();
  window.location.href = `${basePath}${path}`;
}
```

**۴. Realtime Subscription:**
```typescript
// Problem: Multiple subscriptions
// Solution: Clean up on destroy
onDestroy(() => {
  if (channel) supabase.removeChannel(channel);
});
```

**۵. Form Validation:**
```typescript
// Problem: Complex validation rules
// Solution: Custom validation utility
const validation = validateForm(data, {
  field: [validators.required, validators.email]
});
```

**۶. Mobile Keyboard:**
```typescript
// Problem: Keyboard covers inputs
// Solution: Use proper input types and viewport meta
<meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0">
```

**۷. iOS Safari Issues:**
```typescript
// Problem: Backdrop filter not working
// Solution: Add -webkit-backdrop-filter
-webkit-backdrop-filter: blur(10px);
```

**۸. State Management:**
```typescript
// Problem: Store updates not reactive
// Solution: Use $state and $derived properly
let count = $state(0);
let doubled = $derived(count * 2);
```

## ۱۲. راهنمای بازسازی

### ۱۲.۱ گام اول: راه‌اندازی محیط توسعه

**پیش‌نیازها:**
- Node.js 18+ (توصیه می‌شود 20 LTS)
- npm 9+ یا yarn 1.22+
- Git
- حساب Supabase (رایگان)
- (اختیاری) حساب GitHub برای Deployment

**نصب:**
```bash
# 1. Clone یا ایجاد پروژه جدید
mkdir KhodroBan
cd KhodroBan

# 2. ایجاد ساختار پوشه‌ها
mkdir -p docs/{product,strategy,research,tutorials,technical/{api,database}}
mkdir -p backend/{src,tests}
mkdir -p frontend/{src,public}
mkdir -p scripts
mkdir -p reminder-service
mkdir -p supabase/migrations
```

### ۱۲.۲ گام دوم: راه‌اندازی Supabase

**۱. ایجاد پروژه Supabase:**
- به [supabase.com](https://supabase.com) بروید
- Sign in با GitHub/Google
- روی "New Project" کلیک کنید
- نام: `khodroban`
- دیتابیس: PostgreSQL
- منطقه: US East (یا نزدیک‌ترین)
- روی "Create New Project" کلیک کنید

**۲. دریافت اطلاعات اتصال:**
- به Settings > API بروید
- **Project URL**: `https://xyz.supabase.co`
- **anon public**: `eyJhbGciOi...` (کلید طولانی)

**۳. اجرای مایگریشن:**
```bash
# فایل: supabase/migrations/001_initial_schema.sql
# محتوای کامل در بخش ۶.۱ این مستند

# از طریق Supabase SQL Editor:
# 1. به SQL Editor بروید
# 2. محتوای فایل را کپی کنید
# 3. اجرا کنید
```

**۴. فعال‌سازی RLS (Row Level Security):**
```sql
-- در SQL Editor اجرا کنید:
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy برای vehicles
CREATE POLICY "Users can manage their own vehicles"
ON vehicles FOR ALL
USING (auth.uid() = user_id);

-- Policy برای services
CREATE POLICY "Users can manage their own services"
ON services FOR ALL
USING (auth.uid() = user_id);

-- Policy برای expenses
CREATE POLICY "Users can manage their own expenses"
ON daily_expenses FOR ALL
USING (auth.uid() = user_id);

-- Policy برای notifications
CREATE POLICY "Users can see their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);
```

**۵. فعال‌سازی Realtime:**
- به Settings > Replication بروید
- جداول زیر را انتخاب کنید:
  - `notifications`
  - `reminder_logs`
- روی "Save" کلیک کنید

### ۱۲.۳ گام سوم: راه‌اندازی Frontend

**۱. نصب وابستگی‌ها:**
```bash
cd frontend
npm install
```

**۲. ایجاد فایل‌های پیکربندی:**
- `.env` (از `.env.example` کپی بگیرید)
- `svelte.config.js`
- `vite.config.ts`
- `tsconfig.json`
- `.eslintrc.cjs`
- `.prettierrc`

**۳. تنظیم متغیرهای محیطی:**
```env
# frontend/.env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_BACKEND_TYPE=supabase
VITE_APP_NAME=خودروبان
```

**۴. ایجاد ساختار پوشه‌ها:**
```bash
mkdir -p src/lib/{components/{ui,layout,features,organisms},stores,services/{base,auth,vehicle,service,expense,reminder,report,notification},utils/{validation,format,navigation,config,constants},i18n,config}
mkdir -p src/routes/{login,register,dashboard,vehicles,vehicles/[id],add,reminders,reports,settings}
mkdir -p src/styles
mkdir -p src/test
```

**۵. ایجاد فایل‌های اصلی:**
- `src/lib/supabase.ts` (پیکربندی Supabase)
- `src/lib/config/backendConfig.ts` (پیکربندی backend)
- `src/lib/i18n/index.ts` (پیکربندی i18n)
- `src/lib/i18n/fa.json` (ترجمه‌ها)
- `src/lib/i18n/en.json` (ترجمه‌ها)
- `src/lib/i18n/ar.json` (ترجمه‌ها)
- `src/styles/global.css` (استایل‌های پایه)

**۶. کپی کردن کدها:**
از مستندات این فایل، کدهای هر کامپوننت را در فایل‌های مربوطه کپی کنید.

**۷. تست اولیه:**
```bash
npm run dev
# باید در http://localhost:5173 اجرا شود
```

### ۱۲.۴ گام چهارم: راه‌اندازی Backend (Django - Optional)

**۱. نصب Python:**
```bash
# توصیه می‌شود از virtual environment استفاده کنید
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# یا
venv\Scripts\activate  # Windows
```

**۲. نصب وابستگی‌ها:**
```bash
pip install -r requirements.txt
```

**۳. ایجاد پروژه Django:**
```bash
cd backend
django-admin startproject src .
python manage.py startapp api
```

**۴. پیکربندی Django:**
- `settings.py`: تنظیمات دیتابیس، CORS, JWT
- `urls.py`: روت‌های API
- `api/serializers.py`: سریالایزرها
- `api/views.py`: ویوها
- `api/urls.py`: روت‌های API

**۵. اجرای سرور:**
```bash
python manage.py migrate
python manage.py runserver 8000
```

### ۱۲.۵ گام پنجم: راه‌اندازی سرویس یادآوری (Python Cron)

**۱. ایجاد اسکریپت:**
```python
# reminder-service/main.py
import os
import sys
from datetime import datetime, timedelta
from supabase import create_client

# تنظیمات
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_reminders():
    """بررسی یادآورهای خودکار"""
    # 1. دریافت تمام کاربران
    users = supabase.table('user_profiles').select('*').execute()
    
    for user in users.data:
        # 2. دریافت تنظیمات
        settings = supabase.table('reminder_settings').select('*').eq('user_id', user['user_id']).execute()
        if not settings.data:
            continue
        
        settings = settings.data[0]
        
        # 3. دریافت خودروهای کاربر
        vehicles = supabase.table('vehicles').select('*').eq('user_id', user['user_id']).execute()
        
        for vehicle in vehicles.data:
            # 4. بررسی آخرین سرویس
            last_service = supabase.table('services').select('*').eq('vehicle_id', vehicle['vehicle_id']).order('service_date_gregorian', desc=True).limit(1).execute()
            
            if not last_service.data:
                continue
            
            last_service = last_service.data[0]
            
            # 5. محاسبه زمان/کیلومتر باقی‌مانده
            days_passed = (datetime.now() - datetime.fromisoformat(last_service['service_date_gregorian'])).days
            km_passed = vehicle['current_km'] - last_service['service_km']
            
            # 6. بررسی آیا نیاز به یادآوری دارد
            days_until_due = settings['time_interval_months'] * 30 - days_passed
            km_until_due = settings['km_interval'] - km_passed
            
            # 7. ایجاد نوتیفیکیشن اگر نزدیک موعد
            if days_until_due <= settings['alert_days_before'] or km_until_due <= 500:
                status = 'overdue' if days_until_due < 0 or km_until_due < 0 else 'near'
                
                supabase.table('reminder_logs').insert({
                    'user_id': user['user_id'],
                    'vehicle_id': vehicle['vehicle_id'],
                    'title': f"سرویس دوره‌ای {vehicle['model']}",
                    'message': f"کیلومتر باقی‌مانده: {km_until_due} | روز باقی‌مانده: {days_until_due}",
                    'category': 'oil_change',
                    'status': status,
                    'due_km': last_service['service_km'] + settings['km_interval'],
                    'due_date': (datetime.fromisoformat(last_service['service_date_gregorian']) + timedelta(days=settings['time_interval_months'] * 30)).isoformat(),
                    'warning_days_before': settings['alert_days_before'],
                    'source': 'auto'
                }).execute()
                
                # 8. ایجاد نوتیفیکیشن برای realtime
                supabase.table('notifications').insert({
                    'user_id': user['user_id'],
                    'vehicle_id': vehicle['vehicle_id'],
                    'title': f"یادآوری سرویس {vehicle['model']}",
                    'body': f"موعد سرویس نزدیک است. کیلومتر باقی‌مانده: {km_until_due}",
                    'type': 'reminder',
                    'metadata': {
                        'vehicle_model': vehicle['model'],
                        'days_until_due': days_until_due,
                        'km_until_due': km_until_due
                    }
                }).execute()

if __name__ == '__main__':
    check_reminders()
```

**۲. نصب وابستگی‌ها:**
```bash
cd reminder-service
pip install supabase python-dotenv
```

**۳. تنظیم Cron Job:**
```bash
# Linux/Mac (crontab -e)
# هر روز ساعت 9 صبح
0 9 * * * cd /path/to/reminder-service && python main.py

# Windows (Task Scheduler)
# ایجاد تسک جدید - Daily - 9:00 AM
```

**۴. یا استفاده از Python Scheduler:**
```python
# reminder-service/scheduler.py
from apscheduler.schedulers.blocking import BlockingScheduler
from main import check_reminders

scheduler = BlockingScheduler()
scheduler.add_job(check_reminders, 'cron', hour=9, minute=0)
scheduler.start()
```

### ۱۲.۶ گام ششم: Deployment

**Frontend (Netlify):**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/khodroban.git
git push -u origin main

# 2. Connect to Netlify
# - Go to app.netlify.com
# - Add new site > Import from Git
# - Select repository
# - Build command: npm run build
# - Publish directory: build
# - Add environment variables

# 3. Deploy
git push origin main  # Auto-deploys
```

**Backend (Render/Heroku):**
```bash
# 1. Create Procfile
echo "web: gunicorn src.wsgi:application --bind 0.0.0.0:\$PORT" > Procfile

# 2. Create requirements.txt
pip freeze > requirements.txt

# 3. Push to GitHub
git add Procfile requirements.txt
git commit -m "Add deployment files"
git push

# 4. Deploy to Render
# - Go to render.com
# - New > Web Service
# - Connect GitHub repo
# - Build command: pip install -r requirements.txt
# - Start command: gunicorn src.wsgi:application --bind 0.0.0.0:8000
# - Add environment variables
```

**Supabase (Already done in step 2)**

**Reminder Service (Cron Job on VPS):**
```bash
# 1. Rent VPS (DigitalOcean, Hetzner, etc.)
# 2. Install Python, Git
# 3. Clone reminder-service
# 4. Set up cron job
# 5. Add environment variables
```

### ۱۲.۷ گام هفتم: تست و دیباگ

**تست‌های واحد:**
```bash
cd frontend
npm run test
```

**تست‌های سراسری:**
```bash
# 1. لاگین
# 2. افزودن خودرو
# 3. ثبت سرویس
# 4. ثبت هزینه
# 5. ایجاد یادآور
# 6. بررسی گزارش‌ها
# 7. تست خروجی CSV
# 8. تست تنظیمات
# 9. تست لاگین Google
# 10. تست محدودیت نسخه رایگان
```

**دیباگ:**
```bash
# Frontend
npm run dev -- --debug

# Backend
python manage.py runserver --debug

# Supabase
# Settings > Logs > API Logs
```

### ۱۲.۸ گام هشتم: بهینه‌سازی و انتشار

**۱. بررسی Performance:**
```bash
# Lighthouse audit
npm run build
npx serve build
# Run Lighthouse in Chrome DevTools
```

**۲. بهینه‌سازی تصاویر:**
- استفاده از SVG (بدون تصاویر سنگین)

**۳. بررسی Accessibility:**
- ARIA labels
- Keyboard navigation
- Screen reader support

**۴. تست چند زبانه:**
- فارسی (RTL)
- انگلیسی (LTR)
- عربی (RTL)

**۵. تست دستگاه‌های مختلف:**
- Mobile (iOS Safari, Chrome)
- Tablet
- Desktop

**۶. انتشار:**
```bash
# Tag release
git tag v1.0.0
git push origin v1.0.0

# Create release notes
# GitHub > Releases > New Release
```

## ۱۳. نکات مهم برای بازسازی

### ۱۳.۱ ترتیب اجرای مراحل

1. **Supabase** (ضروری)
2. **Frontend** (ضروری)
3. **Backend Django** (اختیاری - برای MVP کافی نیست)
4. **Reminder Service** (برای یادآوری خودکار)
5. **Deployment** (برای استفاده واقعی)

### ۱۳.۲ نکات کلیدی

**✅ انجام دهید:**
- همیشه از `selectService` برای انتخاب backend استفاده کنید
- از `localStorage` برای token استفاده کنید
- از `svelte-i18n` برای ترجمه استفاده کنید
- از `validators` برای اعتبارسنجی استفاده کنید
- از `stores` برای state management استفاده کنید
- از `realtime` برای نوتیفیکیشن استفاده کنید
- RLS را در Supabase فعال کنید
- از `navigateTo` برای routing استفاده کنید

**❌ انجام ندهید:**
- توکن را در URL ذخیره نکنید
- از `innerHTML` برای محتوای کاربر استفاده نکنید
- بدون validation فرم را submit نکنید
- Store را مستقیماً از کامپوننت تغییر ندهید
- API keys را در کد commit نکنید
- بدون cleanup subscription نکنید

### ۱۳.۳ توسعه آینده

**فاز ۲ (PWA):**
- Service Worker
- Offline support
- Push notifications
- Installable app

**فاز ۳ (Mobile App):**
- Capacitor
- Native features (Camera, GPS)
- App stores

**فاز ۴ (AI):**
- Predictive maintenance
- Cost optimization
- Smart recommendations

**فاز ۵ (Social):**
- Share reports
- Compare costs
- Community features

## ۱۴. چک‌لیست نهایی

### قبل از توسعه:
- [ ] حساب Supabase ایجاد شده
- [ ] متغیرهای محیطی تنظیم شده
- [ ] ساختار پوشه‌ها ایجاد شده
- [ ] وابستگی‌ها نصب شده

### در حین توسعه:
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier
- [ ] Component testing
- [ ] Mobile responsiveness
- [ ] RTL support
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### قبل از انتشار:
- [ ] Build بدون خطا
- [ ] Lighthouse score > 90
- [ ] All routes protected
- [ ] Form validations working
- [ ] Realtime notifications working
- [ ] CSV export working
- [ ] Multi-language working
- [ ] Mobile tested
- [ ] Desktop tested

### بعد از انتشار:
- [ ] Analytics setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Documentation updates

---

**این مستندات به طور کامل پروژه KhodroBan را پوشش می‌دهد. برای بازسازی دقیق پروژه، مراحل بالا را به ترتیب دنبال کنید و از کدهای ارائه شده استفاده کنید.**
