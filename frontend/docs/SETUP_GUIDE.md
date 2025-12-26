# 🚀 راهنمای Setup - خودروبان Frontend

این راهنما برای setup اولیه پروژه و فعال‌سازی سیستم بررسی قوانین است.

## 📦 نصب Dependencies

```bash
cd frontend
npm install
```

## 🔧 Setup Git Hooks

برای فعال‌سازی pre-commit و commit-msg hooks:

```bash
# یک بار اجرا کن
npm run prepare
```

این دستور:
- Husky را نصب می‌کند
- Git hooks را در `.husky/` ایجاد می‌کند
- قبل از هر commit، lint و type check اجرا می‌شود

## ✅ بررسی Setup

```bash
# اجرای تمام checks
npm run validate
```

این دستور:
- ✅ Type checking (`svelte-check`)
- ✅ ESLint
- ✅ Prettier format check

## 🧪 تست Git Hooks

### Test Pre-commit Hook

```bash
# یک تغییر کوچک ایجاد کن
echo "// test" >> src/main.ts

# Stage کن
git add src/main.ts

# Commit کن - باید lint و type check اجرا شود
git commit -m "test: check hooks"
```

### Test Commit Message Hook

```bash
# Commit با message نامعتبر
git commit -m "invalid message"
# ❌ باید خطا بدهد

# Commit با message معتبر
git commit -m "feat(test): add test feature"
# ✅ باید قبول شود
```

## 🔍 بررسی دستی

### ESLint

```bash
npm run lint
```

### Type Check

```bash
npm run check
```

### Format Check

```bash
npm run format:check
```

## 🛠️ VS Code Setup

1. Extensions پیشنهادی را نصب کن:
   - Svelte for VS Code
   - ESLint
   - Prettier
   - TypeScript

2. VS Code به صورت خودکار:
   - Format on Save را فعال می‌کند
   - ESLint errors را نشان می‌دهد
   - Type errors را نشان می‌دهد

## 📝 Next Steps

1. ✅ Dependencies نصب شد
2. ✅ Git hooks فعال شد
3. ✅ VS Code extensions نصب شد
4. ✅ Validation tests موفق شد

حالا می‌توانی شروع به توسعه کنی! 🎉

برای اطلاعات بیشتر، `DEVELOPMENT_GUIDE.md` را بخوان.
