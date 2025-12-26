# 🛠️ راهنمای توسعه - خودروبان

این راهنما برای اطمینان از رعایت قوانین در توسعه‌های بعدی است.

## 📋 قبل از شروع کدنویسی

### 1. بررسی قوانین مرتبط

قبل از شروع هر feature جدید:
1. فایل‌های `.cursor/rules` را بررسی کن
2. قوانین مرتبط با feature را بخوان
3. از `CODE_REVIEW_CHECKLIST.md` استفاده کن

### 2. Setup محیط توسعه

```bash
# نصب dependencies
npm install

# Setup Git hooks (یک بار)
npm run prepare

# اجرای validation
npm run validate
```

## 🔄 فرآیند توسعه

### مرحله 1: ایجاد Branch

```bash
# Format: type/scope-description
git checkout -b feat/auth-add-login
git checkout -b fix/ui-button-styling
git checkout -b refactor/stores-simplify
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### مرحله 2: کدنویسی

#### ✅ چک‌لیست حین کدنویسی:

- [ ] **Component Design**
  - Component کمتر از 200 خط؟
  - Single Responsibility رعایت شده؟
  - Props type-safe هستند؟

- [ ] **Responsive Design**
  - Mobile-First approach؟
  - Touch targets حداقل 44px؟
  - Media queries فقط `min-width`؟

- [ ] **Accessibility**
  - Semantic HTML؟
  - `aria-label` برای icon buttons؟
  - Keyboard navigation کار می‌کند؟

- [ ] **State Management**
  - Local state برای component-specific؟
  - Global state در stores؟
  - Immutable updates؟

### مرحله 3: قبل از Commit

```bash
# اجرای خودکار با pre-commit hook:
# - ESLint
# - Prettier
# - Type Check

# یا دستی:
npm run validate
```

### مرحله 4: Commit

```bash
# Format: type(scope): subject
git commit -m "feat(auth): add login functionality"
git commit -m "fix(ui): resolve button click issue"
git commit -m "docs: update README"
```

**Commit message validation:** به صورت خودکار با Husky بررسی می‌شود.

### مرحله 5: Push و Pull Request

1. Push branch:
   ```bash
   git push origin feat/your-feature
   ```

2. ایجاد Pull Request در GitHub

3. **قبل از merge:** از `CODE_REVIEW_CHECKLIST.md` استفاده کن

## 🧪 Testing

### Unit Tests

```bash
# در آینده اضافه می‌شود
npm run test:unit
```

### Type Checking

```bash
npm run check
```

### Linting

```bash
# بررسی
npm run lint

# اصلاح خودکار
npm run lint:fix
```

### Formatting

```bash
# Format کردن
npm run format

# بررسی
npm run format:check
```

## 📊 CI/CD

هر Pull Request به صورت خودکار:

1. ✅ **Lint & Type Check** - بررسی syntax و types
2. ✅ **Build** - بررسی build موفق
3. ✅ **Bundle Size** - بررسی حجم bundle < 170KB
4. ✅ **Accessibility** - بررسی دسترسی‌پذیری (در آینده)

## 🚨 حل مشکلات رایج

### ESLint Errors

```bash
# دیدن errors
npm run lint

# اصلاح خودکار
npm run lint:fix
```

### Type Errors

```bash
# بررسی types
npm run check
```

### Pre-commit Hook Failed

اگر pre-commit hook خطا داد:
1. خطا را بخوان
2. مشکل را حل کن (lint, format, type check)
3. دوباره commit کن

### Commit Message Rejected

اگر commit message رد شد:
```bash
# Format صحیح:
type(scope): subject

# Examples:
feat(auth): add login
fix(ui): resolve button issue
docs: update README
```

## 📚 منابع

- **قوانین:** `.cursor/rules/`
- **Code Review:** `CODE_REVIEW_CHECKLIST.md`
- **ESLint Config:** `.eslintrc.cjs`
- **Prettier Config:** `.prettierrc`

## 💡 نکات مهم

1. **همیشه قبل از commit:** `npm run validate` اجرا کن
2. **قبل از PR:** از `CODE_REVIEW_CHECKLIST.md` استفاده کن
3. **در صورت شک:** قوانین در `.cursor/rules/` را بررسی کن
4. **CI/CD:** اگر CI failed شد، PR را merge نکن

---

**هدف:** اطمینان از کیفیت کد و رعایت قوانین در تمام مراحل توسعه 🎯
