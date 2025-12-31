# مستند فنی کامل خودروبان (KhodroBan)

**تاریخ ایجاد:** ۱۴۰۳/۱۰/۱۱  
**نسخه:** ۱.۰.۰  
**وضعیت:** MVP (Minimum Viable Product)

---

## فهرست مطالب

1. [نمای کلی](#۱-نمای-کلی)
2. [ساختار پروژه](#۲-ساختار-پروژه)
3. [معماری فنی](#۳-معماری-فنی)
4. [تکنولوژی‌ها](#۴-تکنولوژی‌ها)
5. [ویژگی‌ها](#۵-ویژگی‌ها)
6. [مدل‌های داده](#۶-مدل‌های-داده)
7. [API](#۷-api)
8. [رابط کاربری](#۸-رابط-کاربری)
9. [طراحی بصری](#۹-طراحی-بصری)
10. [پیکربندی](#۱۰-پیکربندی)
11. [بهینه‌سازی](#۱۱-بهینه‌سازی)
12. [راهنمای بازسازی](#۱۲-راهنمای-بازسازی)
13. [نکات مهم](#۱۳-نکات-مهم)
14. [چک‌لیست](#۱۴-چک‌لیست)

---

## ۱. نمای کلی

### هدف برنامه
مدیریت هوشمند سرویس‌های دوره‌ای و هزینه‌های خودرو با سیستم یادآوری خودکار.

### ویژگی‌های کلیدی
- ✅ مدیریت چند خودرو
- ✅ ثبت سرویس‌های دوره‌ای
- ✅ ثبت هزینه‌های روزانه
- ✅ یادآوری هوشمند (۷ روز قبل)
- ✅ گزارش‌گیری پیشرفته
- ✅ چند زبانه (فارسی، انگلیسی، عربی)
- ✅ طراحی واکنش‌گرا (Mobile-First)
- ✅ مدل Freemium

### معماری کلی
```
Frontend (SvelteKit) → Supabase (PostgreSQL) → Python Cron Job
         ↓
   Realtime Updates
```

---

## ۲. ساختار پروژه

```
KhodroBan/
├── 📂 docs/
│   ├── 📂 product/
│   ├── 📂 strategy/
│   ├── 📂 research/
│   ├── 📂 tutorials/
│   └── 📂 technical/
│       ├── RECONSTRUCTION_GUIDE.md (این فایل)
│       └── COMPLETE_TECHNICAL_DOCUMENTATION.md
│
├── 📂 backend/ (Django - Optional)
│   ├── 📂 src/
│   ├── 📂 tests/
│   └── requirements.txt
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 lib/
│   │   │   ├── 📂 components/
│   │   │   │   ├── 📂 ui/ (Atoms)
│   │   │   │   ├── 📂 layout/ (Organisms)
│   │   │   │   ├── 📂 features/ (Molecules)
│   │   │   │   └── 📂 organisms/ (Complex)
│   │   │   ├── 📂 stores/ (State)
│   │   │   ├── 📂 services/ (Business Logic)
│   │   │   ├── 📂 utils/ (Helpers)
│   │   │   ├── 📂 i18n/ (Translations)
│   │   │   └── 📂 config/ (Settings)
│   │   ├── 📂 routes/ (Pages)
│   │   └── 📂 styles/ (CSS)
│   ├── 📂 public/
│   ├── package.json
│   ├── vite.config.ts
│   └── svelte.config.js
│
├── 📂 reminder-service/ (Python Cron)
│   ├── main.py
│   └── scheduler.py
│
└── 📂 supabase/
    ├── 📂 migrations/
    │   └── 001_initial_schema.sql
    └── config.toml
```

---

## ۳. معماری فنی

### ۳.۱ الگوی معماری
**Service-Based Architecture با State Management**

```
UI Layer (Svelte Components)
    ↓
Store Layer (Svelte Stores)
    ↓
Service Layer (Business Logic)
    ↓
Data Layer (Supabase/Django/Mock)
```

### ۳.۲ جریان داده

**User Input → UI → Store → Service → API → DB**

**DB Change → Supabase Realtime → Store → UI**

**Cron Job → Logic → Notification Table → Realtime → UI**

### ۳.۳ State Management

**Stores اصلی:**
- `authStore`: وضعیت احراز هویت
- `vehiclesStore`: لیست خودروها
- `servicesStore`: رکوردهای سرویس
- `expensesStore`: رکوردهای هزینه
- `remindersStore`: یادآورها
- `toastStore`: نوتیفیکیشن‌ها
- `uiStore`: وضعیت UI

**Derived Stores:**
```typescript
export const isAuthenticated = derived(authStore, $auth => !!$auth.token);
export const vehicleCount = derived(vehiclesStore, $store => $store.vehicles.length);
export const activeReminders = derived(remindersStore, $store => $store.reminders.filter(r => !r.dismissed));
```

---

## ۴. تکنولوژی‌ها

### ۴.۱ اصلی
| تکنولوژی | نسخه | نقش |
|---------|------|-----|
| SvelteKit | 2.0.0 | فریمورک |
| Vite | 5.4.0 | Build tool |
| TypeScript | 5.6.0 | زبان |
| Supabase | 2.89.0 | Backend |
| PostgreSQL | 15.x | دیتابیس |

### ۴.۲ کتابخانه‌ها
- `axios`: HTTP client
- `svelte-i18n`: بین‌المللی‌سازی
- `chart.js`: نمودارها
- `persian-date`: تاریخ شمسی

### ۴.۳ توسعه
- `eslint`: Linting
- `prettier`: Formatting
- `vitest`: Testing
- `husky`: Git hooks

---

## ۵. ویژگی‌ها

### ۵.۱ احراز هویت
- **Supabase Auth**: ایمیل/رمز
- **Google OAuth**: ورود با Google
- **Session**: localStorage
- **Guard**: Route protection

### ۵.۲ خودروها
- افزودن/ویرایش/حذف
- کیلومتر فعلی
- وضعیت سرویس (عادی، نزدیک، گذشته)
- محدودیت: ۳ خودرو (رایگان)

### ۵.۳ سرویس‌ها
- دسته‌بندی: روغن، فیلتر، ترمز، ...
- تاریخ شمسی/میلادی
- کیلومتر و هزینه
- یادداشت

### ۵.۴ هزینه‌ها
- دسته‌بندی: سوخت، کارواش، پارکینگ، ...
- تاریخ و مبلغ
- کیلومتر (اختیاری)
- یادداشت

### ۵.۵ یادآورها
- **خودکار**: هر ۵۰۰۰ کیلومتر / هر ۳ ماه
- **هشدار**: ۷ روز قبل
- **دسته‌بندی**: عادی، نزدیک، گذشته
- **منبع**: دستی یا خودکار

### ۵.۶ گزارش‌ها
- خلاصه هزینه‌ها
- دسته‌بندی‌ها
- روند ماهانه
- خروجی CSV (همه)
- خروجی PDF (فقط Pro)

---

## ۶. مدل‌های داده

### ۶.۱ جداول Supabase

**user_profiles:**
```sql
user_id (PK, uuid) → auth.users
first_name: text
last_name: text
tier: enum('free', 'pro') = 'free'
created_at: timestamp
updated_at: timestamp
```

**vehicles:**
```sql
vehicle_id (PK, serial)
user_id (FK)
model: text
plate_number: text
year: integer
current_km: integer
note: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**services:**
```sql
service_id (PK, serial)
vehicle_id (FK)
service_date: date (Gregorian)
service_date_gregorian: text
service_km: integer
cost: integer
service_type: enum
description: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**daily_expenses:**
```sql
expense_id (PK, serial)
vehicle_id (FK)
expense_date: date (Gregorian)
expense_date_gregorian: text
amount: integer
category: enum
km_at_expense: integer (nullable)
description: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**reminder_settings:**
```sql
user_id (PK, FK)
km_interval: integer = 5000
time_interval_months: integer = 3
alert_days_before: integer = 7
channels: jsonb = ['inApp']
created_at: timestamp
updated_at: timestamp
```

**reminder_logs:**
```sql
log_id (PK, serial)
user_id (FK)
vehicle_id (FK, nullable)
title: text
message: text
category: enum
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

**notifications:**
```sql
id (PK, uuid)
user_id (FK)
vehicle_id (FK, nullable)
title: text
body: text
type: enum('reminder', 'warning', 'info', 'subscription')
read: boolean = false
metadata: jsonb
created_at: timestamp
updated_at: timestamp
```

### ۶.۲ روابط
```
user_profiles (1) ── (*) vehicles
vehicles (1) ── (*) services
vehicles (1) ── (*) daily_expenses
vehicles (1) ── (*) reminder_logs
user_profiles (1) ── (*) reminder_settings
user_profiles (1) ── (*) reminder_logs
user_profiles (1) ── (*) notifications
```

---

## ۷. API

### ۷.۱ Service Router
```typescript
export const vehicleService = selectService(
  vehicleServiceMock,
  vehicleServiceSupabase,
  vehicleServiceDjango
);
```

### ۷.۲ Supabase Client
```typescript
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
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: { 'x-client-info': 'khodroban-frontend' },
    },
  }
);
```

### ۷.۳ Error Handling
```typescript
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStore.logout();
      toastStore.error('نشست شما منقضی شده است');
    }
    if (error.response?.status === 403) {
      toastStore.warning('این قابلیت برای کاربران Pro در دسترس است');
    }
    if (!error.response) {
      toastStore.error('خطا در اتصال به سرور');
    }
    return Promise.reject(error);
  }
);
```

### ۷.۴ Endpoints (Django)

**Auth:**
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/profile/`
- `PATCH /api/auth/profile/`
- `POST /api/auth/google/`

**Vehicles:**
- `GET /api/vehicles/`
- `POST /api/vehicles/`
- `GET /api/vehicles/{id}/`
- `PATCH /api/vehicles/{id}/`
- `DELETE /api/vehicles/{id}/`
- `PATCH /api/vehicles/{id}/km/`

**Services:**
- `GET /api/services/`
- `POST /api/services/`
- `GET /api/services/{id}/`
- `PATCH /api/services/{id}/`
- `DELETE /api/services/{id}/`
- `GET /api/services/latest/{vehicle_id}/`

**Expenses:**
- `GET /api/expenses/`
- `POST /api/expenses/`
- `GET /api/expenses/{id}/`
- `PATCH /api/expenses/{id}/`
- `DELETE /api/expenses/{id}/`

**Reminders:**
- `GET /api/reminders/`
- `POST /api/reminders/`
- `GET /api/reminders/{id}/`
- `PATCH /api/reminders/{id}/`
- `DELETE /api/reminders/{id}/`
- `PATCH /api/reminders/{id}/dismiss/`
- `GET /api/reminders/settings/`
- `PATCH /api/reminders/settings/`

**Reports:**
- `GET /api/reports/summary/`
- `GET /api/reports/export/csv/`
- `GET /api/reports/export/pdf/`
- `GET /api/reports/trend/monthly/`

**Notifications:**
- `GET /api/notifications/`
- `PATCH /api/notifications/{id}/read/`
- `PATCH /api/notifications/read-all/`
- `DELETE /api/notifications/{id}/`

---

## ۸. رابط کاربری

### ۸.۱ صفحات

**۱. داشبورد (`/dashboard`)**
- یادآورهای فعال
- لیست خودروها
- دسترسی سریع

**۲. خودروها (`/vehicles`)**
- لیست خودروها
- افزودن/ویرایش/حذف
- محدودیت نسخه رایگان

**۳. جزئیات خودرو (`/vehicles/{id}`)**
- اطلاعات خودرو
- لیست سرویس‌ها
- لیست هزینه‌ها
- به‌روزرسانی کیلومتر

**۴. ثبت جدید (`/add`)**
- تب سرویس
- تب هزینه
- یادآور خودکار

**۵. یادآورها (`/reminders`)**
- فیلترها
- دسته‌بندی‌ها
- ایجاد/ویرایش/حذف

**۶. گزارش‌ها (`/reports`)**
- خلاصه
- دسته‌بندی‌ها
- روند ماهانه
- خروجی

**۷. تنظیمات (`/settings`)**
- پروفایل
- تنظیمات یادآور
- ارتقا به Pro
- خروج

**۸. لاگین (`/login`)**
- فرم لاگین
- Google Login
- لینک ثبت‌نام

**۹. ثبت‌نام (`/register`)**
- فرم ثبت‌نام
- لینک لاگین

### ۸.۲ کامپوننت‌های UI

**Atoms:**
- Button
- Input
- Select
- Textarea
- Badge
- Card
- Modal
- Toast
- Spinner
- EmptyState

**Molecules:**
- GroupedSelect
- Tabs
- LanguageSwitcher

**Organisms:**
- Layout
- Header
- Sidebar
- BottomNav
- ReminderModal
- NotificationBell
- LoginForm
- SocialLoginButtons

---

## ۹. طراحی بصری

### ۹.۱ پالت رنگی
```css
--color-primary: #1e3a8a;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-bg: #f3f4f6;
--color-text: #1f2937;
```

### ۹.۲ Glassmorphism
```css
background: rgba(255, 255, 255, 0.25);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 16px;
```

### ۹.۳ فونت
```css
font-family: 'Vazirmatn', 'IRANSans', 'Tahoma', sans-serif;
```

### ۹.۴ واکنش‌گرایی
- **Mobile (< 768px)**: 1 column
- **Tablet (768px+)**: 2 columns
- **Desktop (1024px+)**: 3 columns

---

## ۱۰. پیکربندی

### ۱۰.۱ Environment Variables
```env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_BACKEND_TYPE=supabase
VITE_APP_NAME=خودروبان
```

### ۱۰.۲ فایل‌های پیکربندی
- `package.json`: وابستگی‌ها و scripts
- `vite.config.ts`: پیکربندی Vite
- `svelte.config.js`: پیکربندی SvelteKit
- `tsconfig.json`: پیکربندی TypeScript
- `.eslintrc.cjs`: پیکربندی ESLint
- `.prettierrc`: پیکربندی Prettier

---

## ۱۱. بهینه‌سازی

### ۱۱.۱ Best Practices
- Svelte 5 Runes
- TypeScript strict mode
- Service-based architecture
- Store pattern
- Error boundaries

### ۱۱.۲ Performance
- Code splitting
- Lazy loading
- Debouncing
- Caching
- Bundle optimization

### ۱۱.۳ Security
- RLS in Supabase
- Input validation
- XSS prevention
- JWT validation
- Route guards

---

## ۱۲. راهنمای بازسازی

### ۱۲.۱ مراحل

**۱. Supabase Setup**
- ایجاد پروژه
- اجرای مایگریشن
- فعال‌سازی RLS
- فعال‌سازی Realtime

**۲. Frontend Setup**
- نصب وابستگی‌ها
- ایجاد ساختار پوشه‌ها
- تنظیم متغیرهای محیطی
- کپی کدها

**۳. Backend Setup (Optional)**
- ایجاد پروژه Django
- نصب وابستگی‌ها
- پیکربندی API

**۴. Reminder Service**
- ایجاد اسکریپت Python
- تنظیم Cron Job

**۵. Deployment**
- Frontend: Netlify/Vercel
- Backend: Render/Heroku
- Reminder: VPS

### ۱۲.۲ دستورات

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (Optional)
cd backend
pip install -r requirements.txt
python manage.py runserver

# Reminder Service
cd reminder-service
pip install supabase python-dotenv
python main.py
```

---

## ۱۳. نکات مهم

### ✅ انجام دهید
- از `selectService` استفاده کنید
- RLS را فعال کنید
- از `validators` استفاده کنید
- از `stores` استفاده کنید
- از `navigateTo` استفاده کنید

### ❌ انجام ندهید
- توکن در URL
- `innerHTML` با محتوای کاربر
- Submit بدون validation
- تغییر مستقیم Store
- Commit API keys

---

## ۱۴. چک‌لیست

### Before Development
- [ ] Supabase account
- [ ] Environment variables
- [ ] Folder structure
- [ ] Dependencies installed

### During Development
- [ ] TypeScript strict
- [ ] ESLint + Prettier
- [ ] Testing
- [ ] Mobile responsive
- [ ] RTL support
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### Before Release
- [ ] Build without errors
- [ ] Lighthouse > 90
- [ ] All routes protected
- [ ] Form validation
- [ ] Realtime working
- [ ] CSV export
- [ ] Multi-language
- [ ] Mobile tested
- [ ] Desktop tested

### After Release
- [ ] Analytics
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User feedback

---

**این مستندات کامل‌ترین راهنما برای بازسازی KhodroBan است. برای شروع، مراحل بخش ۱۲ را دنبال کنید.**
