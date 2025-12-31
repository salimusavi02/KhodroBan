# 📋 برنامه پیاده‌سازی تقویم شمسی/میلادی

**تاریخ ایجاد:** 2025-01-XX  
**وضعیت:** برنامه‌ریزی شده (آماده برای پیاده‌سازی)  
**اولویت:** متوسط  
**زمان تخمینی:** 16-21 ساعت (2.5-3 روز کاری)

---

## ✅ وضعیت فعلی (تایید شده)

### بررسی کدبیس انجام شده:

1. **سیستم i18n موجود:** 
   - Locale در localStorage ذخیره می‌شود (`fa`, `en`, `ar`)
   - فایل: `frontend/src/lib/i18n/index.ts`

2. **کتابخانه‌های موجود:**
   - `persian-date@^1.1.0` نصب است
   - `svelte-i18n@^4.0.1` برای i18n

3. **توابع تاریخ موجود:**
   - `formatJalaliDate()` - تبدیل میلادی به شمسی
   - `parseJalaliDate()` - تبدیل شمسی به میلادی
   - `getCurrentJalaliDate()` - تاریخ امروز شمسی
   - `addMonths()`, `addDays()` - محاسبات تاریخ شمسی
   - `formatDateFull()`, `getRelativeTime()` - فرمت‌های نمایشی
   - فایل: `frontend/src/lib/utils/format.ts`

4. **نحوه استفاده فعلی:**
   - همه تاریخ‌های نمایشی به صورت شمسی نمایش داده می‌شوند
   - در دیتابیس تاریخ میلادی ذخیره می‌شود
   - `input type="date"` فقط در `ReminderModal.svelte` استفاده شده
   - سایر فرم‌ها از text input با format شمسی استفاده می‌کنند

5. **صفحاتی که تاریخ استفاده می‌کنند:**
   - `routes/+page.svelte` (Dashboard)
   - `routes/dashboard/+page.svelte`
   - `routes/add/+page.svelte` (Service/Expense forms)
   - `routes/vehicles/[id]/+page.svelte`
   - `routes/settings/+page.svelte`
   - `lib/components/organisms/ReminderModal.svelte`
   - `lib/components/organisms/NotificationBell.svelte`
   - `lib/services/serviceService.ts`
   - `lib/services/reportService.ts`

---

## 🎯 هدف

افزودن امکان انتخاب بین تقویم شمسی و میلادی با این ویژگی‌ها:

1. **انتخاب خودکار بر اساس زبان:**
   - زبان فارسی (`fa`) → تقویم شمسی (پیش‌فرض)
   - زبان انگلیسی (`en`) → تقویم میلادی (پیش‌فرض)
   - زبان عربی (`ar`) → تقویم میلادی (پیش‌فرض)

2. **امکان تغییر دستی:**
   - کاربر می‌تواند در Settings تقویم مورد نظر را انتخاب کند
   - ترجیح کاربر در localStorage ذخیره می‌شود

3. **سازگاری کامل:**
   - داده‌های موجود (میلادی در دیتابیس) بدون تغییر باقی می‌مانند
   - فقط نمایش و ورودی کاربر تغییر می‌کند
   - تبدیل‌ها در frontend انجام می‌شوند

---

## 📐 معماری پیشنهادی

### 1. Calendar Store

یک store جدید برای مدیریت ترجیح تقویم کاربر:

```typescript
// frontend/src/lib/stores/calendar.ts
type CalendarType = 'jalali' | 'gregorian';

// ویژگی‌ها:
// - ذخیره در localStorage با key: 'calendar'
// - پیش‌فرض بر اساس locale: fa → jalali, en/ar → gregorian
// - Reactive state با Svelte stores
// - Methods: setCalendar(), getCalendar(), initCalendar()
```

### 2. توابع Format بهبود یافته

اصلاح توابع موجود برای پشتیبانی از هر دو تقویم:

```typescript
// frontend/src/lib/utils/format.ts

// توابع جدید (calendar-aware):
// - formatDate(dateStr, calendar?) - بر اساس calendar preference
// - formatGregorianDate(dateStr) - میلادی
// - parseDate(dateStr, calendar?) - هر دو را پشتیبانی کند
// - getCurrentDate(calendar?) - تاریخ امروز
// - addMonths(dateStr, months, calendar?) - محاسبات
// - addDays(dateStr, days, calendar?) - محاسبات

// توابع قدیمی (backward compatible):
// - formatJalaliDate() - با @deprecated
// - parseJalaliDate() - با @deprecated
// - getCurrentJalaliDate() - با @deprecated
```

### 3. DatePicker Component

کامپوننت جدید برای انتخاب تاریخ:

```typescript
// frontend/src/lib/components/ui/DatePicker.svelte

// ویژگی‌ها:
// - پشتیبانی از شمسی و میلادی
// - Two-way binding با bind:value
// - Validation
// - Error handling
// - RTL/LTR support
// - مشابه Input component موجود
```

---

## 📝 فهرست کارها (Checklist)

### ✅ فاز 1: زیرساخت و Store (4-5 ساعت)

#### 1.1. ایجاد Calendar Store

- [ ] ایجاد `frontend/src/lib/stores/calendar.ts`
  - تعریف type: `CalendarType = 'jalali' | 'gregorian'`
  - State: calendar type + reactive state
  - Methods:
    - `setCalendar(type: CalendarType)` - تغییر و ذخیره در localStorage
    - `getCalendar(): CalendarType` - دریافت مقدار فعلی
    - `initCalendar()` - مقداردهی اولیه بر اساس locale
  - ذخیره در localStorage با key: `calendar`
  - پیش‌فرض بر اساس locale:
    - `fa` → `jalali`
    - `en` یا `ar` → `gregorian`

- [ ] اضافه کردن به `frontend/src/lib/stores/index.ts`
  ```typescript
  export { calendarStore, currentCalendar } from './calendar';
  ```

- [ ] تست:
  - تغییر calendar type و بررسی localStorage
  - بررسی پیش‌فرض بر اساس locale

**فایل جدید:**
```
frontend/src/lib/stores/calendar.ts
```

**فایل‌های تغییر یافته:**
```
frontend/src/lib/stores/index.ts
```

---

#### 1.2. بهبود توابع Format

- [ ] اصلاح `frontend/src/lib/utils/format.ts`:

  **الف) توابع جدید:**
  - [ ] `formatGregorianDate(dateStr: string): string`
    - تبدیل تاریخ میلادی به فرمت `YYYY-MM-DD` یا `YYYY/MM/DD`
  
  - [ ] `formatDate(dateStr: string, calendar?: CalendarType): string`
    - اگر `calendar` مشخص نشود، از `calendarStore` استفاده کند
    - اگر `calendar === 'jalali'` → `formatJalaliDate()`
    - اگر `calendar === 'gregorian'` → `formatGregorianDate()`
  
  - [ ] `parseDate(dateStr: string, calendar?: CalendarType): Date`
    - اگر `calendar === 'jalali'` → `parseJalaliDate()`
    - اگر `calendar === 'gregorian'` → `new Date(dateStr)`
  
  - [ ] `getCurrentDate(calendar?: CalendarType): string`
    - تاریخ امروز بر اساس calendar type
  
  - [ ] `addMonths(dateStr: string, months: number, calendar?: CalendarType): string`
    - محاسبه تاریخ با اضافه کردن ماه
  
  - [ ] `addDays(dateStr: string, days: number, calendar?: CalendarType): string`
    - محاسبه تاریخ با اضافه کردن روز
  
  - [ ] `formatDateFull(dateStr: string, calendar?: CalendarType): string`
    - فرمت کامل تاریخ با نام روز
  
  - [ ] `getRelativeTime(dateStr: string, calendar?: CalendarType): string`
    - زمان نسبی (امروز، دیروز، ...)

  **ب) Backward Compatibility:**
  - [ ] علامت `@deprecated` به توابع قدیمی اضافه شود
  - [ ] توابع قدیمی از توابع جدید استفاده کنند:
    ```typescript
    /** @deprecated Use formatDate() instead */
    export function formatJalaliDate(dateStr: string): string {
      return formatDate(dateStr, 'jalali');
    }
    ```

- [ ] تست:
  - تبدیل تاریخ‌های مختلف (شمسی ↔ میلادی)
  - بررسی backward compatibility
  - تست edge cases (29 اسفند، ابتدا/انتهای سال)

**فایل‌های تغییر یافته:**
```
frontend/src/lib/utils/format.ts (تغییرات زیاد)
```

---

#### 1.3. اتصال Calendar Store به i18n

- [ ] اصلاح `frontend/src/lib/i18n/index.ts`:
  - در `setLocale()`: بررسی و تنظیم calendar (اختیاری)
  - پیشنهاد: اگر locale به `fa` تغییر کرد و calendar میلادی بود، می‌توانیم به شمسی تغییر بده (اما اجبار نکنیم)
  
- [ ] تست:
  - تغییر locale و بررسی calendar
  - بررسی persistence در localStorage

**فایل‌های تغییر یافته:**
```
frontend/src/lib/i18n/index.ts (تغییرات جزئی - اختیاری)
```

---

### ✅ فاز 2: DatePicker Component (6-8 ساعت)

#### 2.1. ایجاد DatePicker Component

**تصمیم اولیه:** برای MVP، از text input با mask استفاده می‌کنیم (بدون calendar popup).

**برای v2:** می‌توان calendar popup کامل اضافه کرد.

- [ ] ایجاد `frontend/src/lib/components/ui/DatePicker.svelte`

  **Props:**
  ```typescript
  interface Props {
    value?: string (bindable)
    calendar?: CalendarType // اختیاری، از store استفاده می‌کند
    label?: string
    error?: string
    required?: boolean
    disabled?: boolean
    min?: string // تاریخ حداقل (با format مناسب)
    max?: string // تاریخ حداکثر (با format مناسب)
    placeholder?: string
    name?: string
    hint?: string
  }
  ```

  **ویژگی‌ها:**
  - [ ] Text input با mask مناسب:
    - شمسی: `1403/09/15`
    - میلادی: `2024-12-06` یا `2024/12/06`
  - [ ] Validation:
    - بررسی فرمت
    - بررسی محدودیت‌های min/max
    - نمایش error message
  - [ ] Two-way binding با `bind:value`
  - [ ] RTL/LTR support بر اساس locale
  - [ ] UI/UX مشابه `Input.svelte` موجود
  - [ ] استفاده از `calendarStore` برای پیش‌فرض

- [ ] Export در `frontend/src/lib/components/ui/index.ts`

- [ ] تست:
  - Import و استفاده در یک صفحه ساده
  - تغییر calendar type و بررسی mask
  - Validation
  - RTL/LTR

**فایل جدید:**
```
frontend/src/lib/components/ui/DatePicker.svelte
```

**فایل‌های تغییر یافته:**
```
frontend/src/lib/components/ui/index.ts
```

---

#### 2.2. راه‌حل جایگزین (برای v2)

**برای نسخه‌های بعدی:** می‌توان calendar popup کامل اضافه کرد.

- [ ] بررسی کتابخانه‌های موجود (فعلاً نیاز نیست):
  - `react-persian-datepicker` (React - نیاز به wrapper)
  - `@alireza-ab/vue-persian-datepicker` (Vue - نیاز به wrapper)
  - `persian-datepicker` (jQuery - قدیمی)
  - نتیجه: احتمالاً باید custom بسازیم

**تصمیم برای MVP:**
- استفاده از text input با mask (ساده و سریع)
- برای v2: calendar popup کامل (اگر نیاز بود)

---

### ✅ فاز 3: به‌روزرسانی صفحات (4-5 ساعت)

#### 3.1. صفحه Settings

- [ ] اضافه کردن بخش Calendar Settings در `frontend/src/routes/settings/+page.svelte`:
  - Card جدید با عنوان "تنظیمات تقویم"
  - Select component برای انتخاب تقویم:
    - گزینه 1: "شمسی (Jalali)" 
    - گزینه 2: "میلادی (Gregorian)"
  - پیش‌فرض: بر اساس locale فعلی
  - ذخیره در `calendarStore` هنگام تغییر
  - نمایش hint: "تقویم پیش‌فرض بر اساس زبان شما تنظیم شده است"

- [ ] تست:
  - تغییر calendar در Settings
  - بررسی ذخیره در localStorage
  - بررسی تاثیر بر سایر صفحات

**فایل‌های تغییر یافته:**
```
frontend/src/routes/settings/+page.svelte (اضافه کردن UI)
```

---

#### 3.2. صفحه Add (Service/Expense Forms)

- [ ] اصلاح `frontend/src/routes/add/+page.svelte`:
  - [ ] جایگزینی `getCurrentJalaliDate()` با `getCurrentDate()`
  - [ ] جایگزینی text input تاریخ با `<DatePicker>`:
    - Service form: `<DatePicker bind:value={serviceForm.date} />`
    - Expense form: `<DatePicker bind:value={expenseForm.date} />`
  - [ ] تست validation

- [ ] تست:
  - ثبت سرویس با تقویم شمسی
  - ثبت سرویس با تقویم میلادی
  - ثبت هزینه با هر دو تقویم
  - بررسی ذخیره در دیتابیس (باید میلادی باشد)

**فایل‌های تغییر یافته:**
```
frontend/src/routes/add/+page.svelte (تغییر input تاریخ)
```

---

#### 3.3. ReminderModal

- [ ] اصلاح `frontend/src/lib/components/organisms/ReminderModal.svelte`:
  - [ ] جایگزینی `input type="date"` با `<DatePicker>`
  - [ ] تبدیل تاریخ‌ها در submit:
    - اگر calendar شمسی بود → تبدیل به میلادی قبل از ارسال
    - اگر calendar میلادی بود → ارسال مستقیم
  - [ ] تبدیل تاریخ‌ها در load (edit mode):
    - تبدیل از میلادی به calendar فعلی برای نمایش

- [ ] تست:
  - ایجاد یادآور با تقویم شمسی
  - ایجاد یادآور با تقویم میلادی
  - ویرایش یادآور موجود
  - بررسی ذخیره در دیتابیس

**فایل‌های تغییر یافته:**
```
frontend/src/lib/components/organisms/ReminderModal.svelte (تغییر input تاریخ)
```

---

#### 3.4. صفحات نمایش (Dashboard, Vehicles, Reports)

- [ ] جایگزینی همه `formatJalaliDate()` با `formatDate()` در:

  **الف) Dashboard:**
  - [ ] `frontend/src/routes/+page.svelte`
  - [ ] `frontend/src/routes/dashboard/+page.svelte`
  
  **ب) Vehicle Details:**
  - [ ] `frontend/src/routes/vehicles/[id]/+page.svelte`
  
  **ج) Services:**
  - [ ] `frontend/src/lib/services/serviceService.ts`
    - در `getAll()`, `getById()`, `getLatestForVehicle()`
  
  **د) Reports:**
  - [ ] `frontend/src/lib/services/reportService.ts`
    - در تمام توابع گزارش
  
  **ه) Notifications:**
  - [ ] `frontend/src/lib/components/organisms/NotificationBell.svelte`
    - در `formatDate()`

- [ ] تست:
  - نمایش تاریخ‌ها در Dashboard
  - نمایش تاریخ‌ها در Vehicle Details
  - نمایش تاریخ‌ها در Reports
  - تغییر calendar در Settings و بررسی به‌روزرسانی نمایش

**فایل‌های تغییر یافته:**
```
frontend/src/routes/+page.svelte
frontend/src/routes/dashboard/+page.svelte
frontend/src/routes/vehicles/[id]/+page.svelte
frontend/src/lib/services/serviceService.ts
frontend/src/lib/services/reportService.ts
frontend/src/lib/components/organisms/NotificationBell.svelte
```

---

#### 3.5. Services (ServiceService, ExpenseService)

- [ ] اصلاح `frontend/src/lib/services/serviceService.ts`:
  - [ ] در `create()`: تبدیل `parseJalaliDate()` به `parseDate()`
  - [ ] در `update()`: تبدیل `parseJalaliDate()` به `parseDate()`
  - [ ] در `getAll()`, `getById()`: تبدیل `formatJalaliDate()` به `formatDate()`

- [ ] اصلاح `frontend/src/lib/services/expenseService.ts`:
  - [ ] در `create()`: تبدیل `parseJalaliDate()` به `parseDate()`
  - [ ] در `update()`: تبدیل `parseJalaliDate()` به `parseDate()`
  - [ ] در `getAll()`, `getById()`: تبدیل `formatJalaliDate()` به `formatDate()`

- [ ] تست:
  - CRUD سرویس با تقویم شمسی
  - CRUD سرویس با تقویم میلادی
  - CRUD هزینه با هر دو تقویم
  - بررسی دیتابیس (باید میلادی باشد)

**فایل‌های تغییر یافته:**
```
frontend/src/lib/services/serviceService.ts (تغییرات زیاد)
frontend/src/lib/services/expenseService.ts (تغییرات زیاد)
```

---

### ✅ فاز 4: تست و رفع باگ (2-3 ساعت)

#### 4.1. تست عملکردی

- [ ] **Settings:**
  - [ ] تغییر calendar در Settings
  - [ ] بررسی ذخیره در localStorage
  - [ ] بررسی پیش‌فرض بر اساس locale

- [ ] **Forms:**
  - [ ] ثبت سرویس با تقویم شمسی
  - [ ] ثبت سرویس با تقویم میلادی
  - [ ] ثبت هزینه با هر دو تقویم
  - [ ] ایجاد یادآور با هر دو تقویم
  - [ ] ویرایش یادآور موجود

- [ ] **Display:**
  - [ ] نمایش تاریخ‌ها در Dashboard
  - [ ] نمایش تاریخ‌ها در Vehicle Details
  - [ ] نمایش تاریخ‌ها در Reports
  - [ ] نمایش تاریخ‌ها در Notifications

- [ ] **Integration:**
  - [ ] تغییر calendar و بررسی به‌روزرسانی همه صفحات
  - [ ] تغییر locale و بررسی calendar (اگر اتصال داشتیم)

---

#### 4.2. تست تبدیل تاریخ

- [ ] **تبدیل شمسی → میلادی (submit):**
  - [ ] تاریخ‌های عادی
  - [ ] ابتدای سال (1 فروردین)
  - [ ] انتهای سال (29/30 اسفند)
  - [ ] سال کبیسه (29 اسفند)

- [ ] **تبدیل میلادی → شمسی (display):**
  - [ ] تاریخ‌های عادی
  - [ ] ابتدای سال میلادی
  - [ ] انتهای سال میلادی

- [ ] **Edge Cases:**
  - [ ] تاریخ‌های قدیمی (1350 شمسی)
  - [ ] تاریخ‌های آینده
  - [ ] تاریخ‌های نامعتبر (handling error)

---

#### 4.3. تست UX

- [ ] **Localization:**
  - [ ] تغییر locale و تاثیر بر calendar
  - [ ] RTL با تقویم شمسی
  - [ ] LTR با تقویم میلادی

- [ ] **Responsive:**
  - [ ] Mobile: DatePicker
  - [ ] Tablet: DatePicker
  - [ ] Desktop: DatePicker

- [ ] **Accessibility:**
  - [ ] Keyboard navigation
  - [ ] Screen reader
  - [ ] Focus management

- [ ] **Performance:**
  - [ ] بررسی re-render هنگام تغییر calendar
  - [ ] بررسی memory leaks

---

#### 4.4. رفع باگ‌ها

- [ ] فهرست باگ‌های پیدا شده
- [ ] اولویت‌بندی (Critical, High, Medium, Low)
- [ ] رفع باگ‌ها بر اساس اولویت
- [ ] تست مجدد

---

## 📊 خلاصه زمان‌بندی

| فاز | شرح | زمان تخمینی |
|-----|-----|-------------|
| **فاز 1** | زیرساخت و Store | 4-5 ساعت |
| **فاز 2** | DatePicker Component | 6-8 ساعت |
| **فاز 3** | به‌روزرسانی صفحات | 4-5 ساعت |
| **فاز 4** | تست و رفع باگ | 2-3 ساعت |
| **جمع** | **کل پروژه** | **16-21 ساعت** |

**زمان واقع‌بینانه:** 2.5-3 روز کاری

---

## ⚠️ ریسک‌ها و راهکارها

### ریسک 1: تبدیل تاریخ (متوسط)

**مشکل:** خطا در تبدیل تاریخ می‌تواند منجر به نمایش یا ذخیره تاریخ اشتباه شود.

**راهکار:**
- استفاده از کتابخانه `persian-date` که قابل اعتماد است
- Try-catch در همه تبدیل‌ها
- Fallback: اگر تبدیل خطا داشت، میلادی نمایش بده (یا error message)
- تست کامل edge cases (29 اسفند، ابتدا/انتهای سال)

---

### ریسک 2: DatePicker پیچیده (متوسط)

**مشکل:** ساخت calendar popup کامل می‌تواند زمان‌بر باشد.

**راهکار:**
- **برای MVP:** استفاده از text input با mask (ساده و سریع)
- **برای v2:** calendar popup کامل (اگر نیاز بود)
- اولویت: کارکرد > زیبایی

---

### ریسک 3: فراموش کردن برخی صفحات (متوسط)

**مشکل:** ممکن است در برخی صفحات یا کامپوننت‌ها `formatJalaliDate()` فراموش شود.

**راهکار:**
- جستجوی کامل در کل پروژه: `grep -r "formatJalaliDate" frontend/src`
- فهرست کامل صفحات (در بالا ذکر شده)
- تست دستی همه صفحات پس از پیاده‌سازی
- استفاده از TypeScript برای کمک به پیدا کردن usage ها

---

### ریسک 4: سازگاری با داده‌های موجود (پایین)

**مشکل:** داده‌های موجود در دیتابیس به صورت میلادی ذخیره شده‌اند.

**راهکار:**
- فقط نمایش و ورودی کاربر تغییر می‌کند
- دیتابیس میلادی باقی می‌ماند (بدون migration)
- تبدیل‌ها در frontend انجام می‌شوند
- این ریسک پایین است چون فقط نمایش تغییر می‌کند

---

## 🔍 نکات پیاده‌سازی

### 1. Calendar Store Pattern

```typescript
// پیشنهاد: مشابه authStore
// - localStorage برای persistence
// - reactive state با Svelte stores
// - methods برای set/get
// - initialization در layout یا app startup
```

**مثال:**
```typescript
// frontend/src/lib/stores/calendar.ts
import { writable, get } from 'svelte/store';
import { locale } from '../i18n';

type CalendarType = 'jalali' | 'gregorian';

function getDefaultCalendar(): CalendarType {
  const currentLocale = get(locale);
  if (currentLocale === 'fa') return 'jalali';
  return 'gregorian';
}

function createCalendarStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('calendar') as CalendarType | null
    : null;
  
  const initial = stored || getDefaultCalendar();
  
  const { subscribe, set, update } = writable<CalendarType>(initial);

  return {
    subscribe,
    set: (type: CalendarType) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('calendar', type);
      }
      set(type);
    },
    get: () => get({ subscribe }),
    init: () => {
      const current = getDefaultCalendar();
      if (!stored) {
        set(current);
      }
    }
  };
}

export const calendarStore = createCalendarStore();
export const currentCalendar = calendarStore;
```

---

### 2. Format Functions Pattern

```typescript
// پیشنهاد: backward compatible
// - توابع قدیمی با @deprecated
// - توابع جدید با calendar parameter (optional)
// - default: از store استفاده کند
```

**مثال:**
```typescript
// frontend/src/lib/utils/format.ts
import { get } from 'svelte/store';
import { calendarStore } from '../stores/calendar';
import type { CalendarType } from '../stores/calendar';

export function formatDate(dateStr: string, calendar?: CalendarType): string {
  if (!dateStr) return '';
  
  const cal = calendar || get(calendarStore);
  
  if (cal === 'jalali') {
    return formatJalaliDate(dateStr);
  }
  
  return formatGregorianDate(dateStr);
}

/** @deprecated Use formatDate() instead */
export function formatJalaliDate(dateStr: string): string {
  // Implementation موجود
}
```

---

### 3. DatePicker Pattern

```typescript
// پیشنهاد: مشابه Input component
// - Props مشابه Input
// - Two-way binding با bind:value
// - Error handling
// - Validation
```

**مثال:**
```svelte
<!-- frontend/src/lib/components/ui/DatePicker.svelte -->
<script lang="ts">
  import { get } from 'svelte/store';
  import { calendarStore } from '../../stores/calendar';
  import type { CalendarType } from '../../stores/calendar';

  interface Props {
    value?: string;
    calendar?: CalendarType;
    label?: string;
    error?: string;
    // ... other props
  }

  let { value = $bindable(), calendar, ...rest }: Props = $props();
  
  const cal = calendar || get(calendarStore);
  const mask = cal === 'jalali' ? 'YYYY/MM/DD' : 'YYYY-MM-DD';
  // ...
</script>
```

---

### 4. Settings Pattern

```typescript
// پیشنهاد: Card جدید در Settings
// - Select برای انتخاب calendar
// - پیش‌فرض: بر اساس locale
// - ذخیره در store (localStorage)
```

**مثال:**
```svelte
<!-- در frontend/src/routes/settings/+page.svelte -->
<Card variant="solid" padding="lg" title="تنظیمات تقویم">
  <Select
    label="نوع تقویم"
    bind:value={selectedCalendar}
    options={[
      { value: 'jalali', label: 'شمسی (Jalali)' },
      { value: 'gregorian', label: 'میلادی (Gregorian)' }
    ]}
    hint="تقویم پیش‌فرض بر اساس زبان شما تنظیم شده است"
  />
  <Button onclick={saveCalendar}>ذخیره</Button>
</Card>
```

---

## 📌 سوالات و تصمیم‌گیری‌ها

### سوال 1: آیا calendar باید مستقل از locale باشد؟

**پاسخ:** بله، اما پیش‌فرض بر اساس locale تنظیم می‌شود.

**توضیح:**
- کاربر می‌تواند manual تغییر بده
- مثال: فارسی‌زبان می‌تواند میلادی انتخاب کند
- پیش‌فرض: `fa` → `jalali`, `en/ar` → `gregorian`

---

### سوال 2: آیا باید calendar در backend ذخیره شود؟

**پاسخ:** خیر (فعلاً).

**توضیح:**
- فقط در frontend (localStorage) ذخیره می‌شود
- در آینده می‌توان به user preferences در backend اضافه کرد
- برای MVP: localStorage کافی است

---

### سوال 3: DatePicker: simple یا advanced؟

**پاسخ:** برای MVP → simple (text input با mask).

**توضیح:**
- **MVP:** text input با mask و validation (سریع و ساده)
- **v2:** calendar popup کامل (اگر نیاز بود)
- اولویت: کارکرد > زیبایی

---

### سوال 4: آیا باید توابع قدیمی را حذف کنیم؟

**پاسخ:** خیر (فعلاً).

**توضیح:**
- با `@deprecated` علامت بزن
- در v2 می‌توان حذف کرد
- حفظ backward compatibility برای اطمینان

---

## ✅ نتیجه‌گیری

| معیار | امتیاز |
|-------|--------|
| **امکان‌پذیری** | ✅ بله |
| **هزینه فنی** | ⚠️ متوسط-بالا (16-21 ساعت) |
| **زمان** | ⏱️ 2.5-3 روز کاری |
| **ریسک** | ⚠️ متوسط (قابل کنترل با فازبندی) |

---

## 📝 توصیه نهایی

1. **فازبندی:** فاز 1 → 2 → 3 → 4 (مرتب)
2. **اولویت:** زیرساخت → DatePicker → صفحات → تست
3. **MVP:** text input با mask (بدون calendar popup)
4. **v2:** calendar popup کامل (اگر نیاز بود)
5. **تست:** همه صفحات دستی تست شوند
6. **Backward Compatibility:** حفظ توابع قدیمی با `@deprecated`

---

## 📚 منابع

- کتابخانه `persian-date`: https://www.npmjs.com/package/persian-date
- Svelte Stores: https://svelte.dev/docs/svelte-store
- Svelte i18n: https://github.com/kaisermann/svelte-i18n

---

**آماده برای پیاده‌سازی** ✅

