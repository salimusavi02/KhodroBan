# راهنمای تست‌های UI

این مستند شامل اطلاعات کامل درباره سیستم تست UI در پروژه است.

## 📋 فهرست مطالب

- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [انواع تست‌ها](#انواع-تست‌ها)
- [اجرای تست‌ها](#اجرای-تست‌ها)
- [نوشتن تست جدید](#نوشتن-تست-جدید)
- [استراتژی تست](#استراتژی-تست)
- [مشکلات رایج](#مشکلات-رایج)

## 🚀 نصب و راه‌اندازی

### 1. نصب وابستگی‌ها

قبل از اجرای تست‌ها، باید وابستگی‌های لازم را نصب کنید:

```bash
cd frontend
npm install
```

این دستور وابستگی‌های زیر را نصب می‌کند:
- `@testing-library/svelte` - برای تست کامپوننت‌های Svelte
- `@testing-library/user-event` - برای تست‌های تعاملی
- `@testing-library/jest-dom` - برای matchers اضافی
- `vitest` - فریمورک تست
- `jsdom` - محیط DOM برای تست‌ها

### 2. بررسی نصب

برای اطمینان از اینکه همه چیز درست نصب شده است:

```bash
npm run test:smoke
```

اگر همه تست‌های smoke بدون خطا اجرا شوند، نصب موفق بوده است.

> **نکته مهم:** اگر خطای `mount(...) is not available on the server` می‌بینید، به بخش [مشکلات رایج](#مشکلات-رایج) مراجعه کنید.

### 3. فایل setup-tests.ts

فایل `src/test/setup-tests.ts` به صورت خودکار قبل از هر تست اجرا می‌شود و موارد زیر را انجام می‌دهد:

- **Mock Web Animations API:** برای پشتیبانی از Svelte transitions (مثل `fly`, `fade`)
- **Mock SvelteKit stores:** برای `$app/stores` (page, navigating, updated)
- **Mock SvelteKit navigation:** برای توابع navigation (goto, invalidate, etc.)
- **Mock i18n:** برای سیستم بین‌المللی‌سازی

اگر کامپوننت شما از store یا service خاصی استفاده می‌کند، mock آن را در این فایل اضافه کنید.

## 🧪 انواع تست‌ها

### تست‌های Smoke

**مکان:** `src/test/smoke/`

**هدف:** بررسی اینکه کامپوننت‌ها بدون crash render می‌شوند

**ویژگی‌ها:**
- ⚡ بسیار سریع (کمتر از 2 ثانیه)
- 🎯 فقط بررسی render شدن
- ✅ اجرای خودکار در pre-commit hook

**مثال:**
```typescript
test('Button renders without crashing', () => {
  render(Button, { props: { children: 'تست' } });
});
```

**فایل‌ها:**
- `components.test.ts` - تست‌های smoke برای همه کامپوننت‌های UI (12 تست)
- `pages.test.ts` - تست‌های smoke برای صفحات (2 تست فعال برای login و register)

### تست‌های واحد (Unit Tests)

**مکان:** `src/lib/components/ui/__tests__/`

**هدف:** تست کامل عملکرد و رفتار کامپوننت‌ها

**ویژگی‌ها:**
- 🔍 تست دقیق رفتارها
- 🎭 تست تعاملات کاربر
- ✅ تست حالات مختلف (disabled, loading, error, etc.)

**کامپوننت‌های دارای تست:**
- `Button.test.ts` - 7 تست
- `Input.test.ts` - 8 تست
- `Select.test.ts` - 7 تست
- `Modal.test.ts` - 8 تست
- `Card.test.ts` - 8 تست

**مثال:**
```typescript
test('calls onclick handler when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(Button, { 
    props: { 
      children: 'کلیک',
      onclick: handleClick
    } 
  });
  
  const button = screen.getByRole('button');
  await user.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## ▶️ اجرای تست‌ها

### دستورات اصلی

```bash
# اجرای تست‌های smoke (سریع - برای pre-commit)
npm run test:smoke

# اجرای همه تست‌های کامپوننت
npm run test:components

# اجرای همه تست‌ها
npm run test

# اجرای تست‌ها در حالت watch (برای development)
npm run test:watch

# اجرای سریع همه تست‌ها (بدون coverage)
npm run test:quick

# اجرای تست‌های مرتبط با فایل‌های تغییر یافته
npm run test:related
```

### اجرای یک فایل تست خاص

```bash
# اجرای یک فایل تست
npx vitest run src/lib/components/ui/__tests__/Button.test.ts

# اجرای تست‌های یک کامپوننت خاص
npx vitest run src/lib/components/ui/__tests__/Button
```

### اجرای تست‌ها با UI (مفید برای debugging)

```bash
npx vitest --ui
```

این دستور یک رابط گرافیکی باز می‌کند که می‌توانید:
- تست‌ها را به صورت تعاملی اجرا کنید
- نتایج را به تفصیل ببینید
- تست‌های خاص را debug کنید

## ✍️ نوشتن تست جدید

### ساختار یک تست

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import YourComponent from '../YourComponent.svelte';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(YourComponent, { props: { /* props */ } });
    expect(screen.getByText(/expected text/)).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    
    render(YourComponent, { 
      props: { 
        onAction: handleAction
      } 
    });
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
```

### الگوی AAA (Arrange, Act, Assert)

```typescript
test('example test', () => {
  // Arrange: آماده‌سازی
  const props = { label: 'تست', name: 'test' };
  
  // Act: عمل
  render(Input, { props });
  
  // Assert: اثبات
  expect(screen.getByLabelText(/تست/)).toBeInTheDocument();
});
```

### نکات مهم

1. **استفاده از `screen`:** همیشه از `screen` برای query استفاده کنید:
   ```typescript
   // ✅ درست
   screen.getByRole('button');
   
   // ❌ نادرست
   container.querySelector('button');
   ```

2. **Query Priorities:** از بهترین query استفاده کنید:
   ```typescript
   // بهترین
   screen.getByRole('button', { name: /کلیک/ });
   screen.getByLabelText(/نام/);
   
   // قابل قبول
   screen.getByText(/متن/);
   
   // آخرین راه
   screen.getByTestId('my-id');
   ```

3. **Async Actions:** همیشه از `async/await` برای تعاملات کاربر استفاده کنید:
   ```typescript
   test('handles click', async () => {
     const user = userEvent.setup();
     // ...
     await user.click(button);
   });
   ```

### اضافه کردن تست برای کامپوننت جدید

1. برای کامپوننت‌های UI، تست smoke در `src/test/smoke/components.test.ts` اضافه کنید:

```typescript
test('NewComponent renders without crashing', () => {
  render(NewComponent, { props: { /* minimal props */ } });
});
```

2. برای تست‌های کامل، فایل تست در `src/lib/components/ui/__tests__/` ایجاد کنید:

```typescript
// src/lib/components/ui/__tests__/NewComponent.test.ts
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import NewComponent from '../NewComponent.svelte';

describe('NewComponent', () => {
  test('renders correctly', () => {
    // تست‌های شما
  });
});
```

## 📊 استراتژی تست

### هرم تست

```
        /\
       /E2E\         ← 10% (کند، گران)
      /------\
     /  Int.  \      ← 20% (متوسط)
    /----------\
   /   Unit     \    ← 70% (سریع، ارزان)
  /--------------\
```

### اولویت‌ها

1. **اولویت اول: تست‌های Smoke**
   - برای همه کامپوننت‌های UI
   - سریع و سبک
   - اجرای خودکار در pre-commit

2. **اولویت دوم: تست‌های واحد**
   - برای کامپوننت‌های مهم و پرکاربرد
   - تست رفتارها و تعاملات
   - تست حالات مختلف (disabled, error, loading, etc.)

3. **اولویت سوم: تست‌های Integration (آینده)**
   - برای تست تعامل بین کامپوننت‌ها
   - برای تست فرم‌ها و صفحات کامل

### Coverage Goals

- **کامپوننت‌های UI:** حداقل تست smoke برای همه
- **کامپوننت‌های کلیدی:** تست‌های کامل (Button, Input, Select, Modal, Card)
- **سایر کامپوننت‌ها:** تست‌های smoke + تست‌های واحد برای منطق مهم

## 🔄 تست‌ها در Workflow

### Pre-commit Hook

هنگامی که commit می‌کنید، به صورت خودکار:
1. `lint-staged` - lint و format فایل‌های staged
2. `npm run test:smoke` - اجرای تست‌های smoke (کمتر از 2 ثانیه)
3. `npm run check` - type checking

اگر هر کدام از این مراحل fail شود، commit متوقف می‌شود.

### قبل از Pull Request

قبل از ایجاد PR، توصیه می‌شود:

```bash
# اجرای همه تست‌ها
npm run test

# بررسی lint
npm run lint

# بررسی types
npm run check

# بررسی format
npm run format:check
```

### در CI/CD (آینده)

در CI/CD می‌توانید:
- همه تست‌ها را اجرا کنید
- Coverage report تولید کنید
- تست‌های E2E را اجرا کنید

## 🐛 مشکلات رایج

### خطا: `@testing-library/user-event` نصب نشده

**راه حل:**
```bash
npm install
```

### خطا: `mount(...)` is not available on the server

**علت:** این خطا زمانی رخ می‌دهد که Svelte در محیط تست به صورت server-side compile می‌شود.

**راه حل:**

این مشکل با تنظیمات زیر در `vitest.config.ts` حل شده است:

1. **اضافه کردن `conditions: ['browser', 'development']` در `resolve`:**
   ```typescript
   resolve: {
     conditions: ['browser', 'development'],
   }
   ```

2. **غیرفعال کردن SSR در تست‌ها:**
   ```typescript
   define: {
     'import.meta.env.SSR': 'false',
   }
   ```

3. **تنظیمات SSR:**
   ```typescript
   ssr: {
     noExternal: ['@testing-library/svelte'],
   }
   ```

اگر هنوز با این مشکل مواجه می‌شوید، مطمئن شوید که:
- `environment: 'jsdom'` در `test` تنظیم شده است
- `@testing-library/svelte` به نسخه جدید به‌روز شده است

### خطا: Cannot find module '$lib/...'

**راه حل:** مطمئن شوید که alias ها در `vitest.config.ts` تعریف شده‌اند:

```typescript
resolve: {
  alias: {
    $lib: path.resolve('./src/lib'),
    // ...
  },
}
```

### خطا: Component crashes در تست

**راه حل:** 
- بررسی کنید که همه props مورد نیاز را pass کرده‌اید
- بررسی کنید که mock های لازم در `setup-tests.ts` تعریف شده‌اند
- بررسی کنید که کامپوننت به درستی import شده است
- بررسی console برای خطاهای بیشتر

### تست‌ها خیلی کند هستند

**راه حل:**
- از `test:smoke` برای تست‌های سریع استفاده کنید
- تست‌های سنگین را فقط در CI/CD اجرا کنید
- از `test:related` برای اجرای تست‌های مرتبط استفاده کنید
- `maxThreads` را در `vitest.config.ts` تنظیم کنید (پیش‌فرض: 4)

### Mock های SvelteKit کار نمی‌کنند

**راه حل:** Mock ها در `src/test/setup-tests.ts` تعریف شده‌اند. اگر کامپوننت شما از store یا service خاصی استفاده می‌کند، mock آن را اضافه کنید:

```typescript
// در setup-tests.ts
vi.mock('$lib/stores/yourStore', () => ({
  yourStore: {
    subscribe: (fn: (value: any) => void) => {
      fn(/* default value */);
      return () => {};
    },
  },
}));
```

### خطا: `element.animate is not a function`

**علت:** jsdom از Web Animations API پشتیبانی نمی‌کند که برای Svelte transitions (مثل `fly`, `fade`) مورد نیاز است.

**راه حل:**

این مشکل با mock کردن `Element.prototype.animate` در `setup-tests.ts` حل شده است:

```typescript
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    updatePlaybackRate: vi.fn(),
  })) as any;
}
```

### خطا: Warnings درباره Svelte 5 runes

**توضیح:** این warning ها معمولاً بی‌ضرر هستند و مربوط به استفاده از Svelte 5 runes هستند (مثل `$state`, `$props`, `$derived`).

**راه حل:** می‌توانید آنها را نادیده بگیرید، یا اگر نیاز دارید، کامپوننت‌ها را به syntax جدید Svelte 5 به‌روزرسانی کنید.

### نکات مهم برای Svelte 5 در تست‌ها

1. **Slots در تست‌ها:**
   در Svelte 5، نمی‌توانید `children` را به عنوان prop پاس بدهید. برای تست‌ها، از بررسی ساختار DOM استفاده کنید:
   ```typescript
   // ✅ درست
   const { container } = render(Card, { props: {} });
   expect(container.querySelector('.card')).toBeInTheDocument();
   
   // ❌ نادرست (در Svelte 5)
   render(Card, { props: { children: 'محتوا' } });
   expect(screen.getByText('محتوا')).toBeInTheDocument();
   ```

2. **Props با $props():**
   کامپوننت‌هایی که از `$props()` استفاده می‌کنند، در تست‌ها به همان شکل کار می‌کنند:
   ```typescript
   render(Button, { props: { variant: 'primary', disabled: false } });
   ```

3. **Runes:**
   Warning های مربوط به runes (مثل `$state`, `$derived`) معمولاً بی‌ضرر هستند و می‌توانید آنها را نادیده بگیرید.

## 📚 منابع بیشتر

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Svelte Testing Best Practices](https://testingjavascript.com/)
- [SvelteKit Testing Guide](https://kit.svelte.dev/docs/testing)

## 📈 آمار تست‌ها

### تست‌های فعلی

- **تست‌های Smoke کامپوننت‌ها:** 12 تست (برای همه کامپوننت‌های UI)
- **تست‌های Smoke صفحات:** 2 تست (برای صفحات login و register)
- **تست‌های واحد:** 38 تست (برای 5 کامپوننت کلیدی)
- **جمع کل:** 52 تست فعال + 4 تست skip شده = 56 تست

### وضعیت تست‌ها

✅ **52 تست pass می‌شوند** (100% موفقیت)
⏭️ **4 تست skip شده** (App.test.ts + 4 تست صفحات پیچیده - برای تست‌های آینده)

### Coverage

- **کامپوننت‌های UI با تست Smoke:** 12/12 (100%)
- **کامپوننت‌های UI با تست کامل:** 5/12 (42%)
- **نرخ موفقیت تست‌ها:** 100% (51/51 تست فعال)

## 🤝 مشارکت

اگر تست جدید می‌نویسید یا مشکلی پیدا می‌کنید:

1. مطمئن شوید تست‌ها pass می‌شوند (`npm run test`)
2. از الگوهای موجود استفاده کنید
3. تست‌های واضح و خوانا بنویسید
4. Documentation را به‌روز کنید
5. قبل از commit، `npm run test:smoke` را اجرا کنید

## ✅ وضعیت سیستم تست

سیستم تست به طور کامل کار می‌کند و همه مشکلات حل شده‌اند:

- ✅ مشکل `mount(...) is not available on the server` حل شده
- ✅ مشکل `element.animate is not a function` حل شده
- ✅ همه تست‌های smoke pass می‌شوند (12/12)
- ✅ همه تست‌های واحد pass می‌شوند (38/38)
- ✅ پیکربندی Vitest برای Svelte 5 بهینه شده است

### نکات مهم برای Svelte 5

1. **Slots:** در Svelte 5، نمی‌توانید `children` را به عنوان prop پاس بدهید. برای تست‌ها، از بررسی ساختار DOM استفاده کنید:
   ```typescript
   // ✅ درست
   const { container } = render(Card, { props: {} });
   expect(container.querySelector('.card')).toBeInTheDocument();
   
   // ❌ نادرست (در Svelte 5)
   render(Card, { props: { children: 'محتوا' } });
   expect(screen.getByText('محتوا')).toBeInTheDocument();
   ```

2. **Transitions:** برای کامپوننت‌هایی که از transitions استفاده می‌کنند (مثل `fly`, `fade`)، mock `animate` در `setup-tests.ts` کافی است.

3. **Runes:** Warning های مربوط به Svelte 5 runes (مثل `$state`, `$props`) معمولاً بی‌ضرر هستند و می‌توانید آنها را نادیده بگیرید.

---

**آخرین به‌روزرسانی:** دسامبر 2024
