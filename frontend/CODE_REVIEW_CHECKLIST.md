# 📋 Code Review Checklist - خودروبان

این چک‌لیست باید قبل از merge هر Pull Request بررسی شود.

## 🏗️ Architecture & Structure

- [ ] **Component Design** (`architecture/component-design.mdc`)
  - [ ] Single Responsibility Principle رعایت شده؟
  - [ ] Component کمتر از 200 خط است؟
  - [ ] Props واضح و type-safe هستند؟
  - [ ] Events با `createEventDispatcher` استفاده شده؟

- [ ] **Project Structure** (`architecture/project-structure.mdc`)
  - [ ] فایل در جای درست قرار دارد؟
  - [ ] Naming conventions رعایت شده (PascalCase برای components)؟
  - [ ] از index.ts برای exports استفاده شده؟

- [ ] **Atomic Design** (`architecture/atomic-design.mdc`)
  - [ ] Component در دسته‌بندی درست قرار دارد؟
    - Atoms: Button, Input, Badge
    - Molecules: Card, FormField
    - Organisms: Header, VehicleCard
    - Templates: Layout

## 🎨 UI/UX

- [ ] **Responsive Design** (`ui-ux/responsive-design.mdc`)
  - [ ] Mobile-First approach استفاده شده؟
  - [ ] Media queries فقط `min-width` دارند؟
  - [ ] Touch targets حداقل 44×44px هستند؟
  - [ ] از relative units (rem, em, %) استفاده شده؟

- [ ] **Accessibility** (`ui-ux/accessibility.mdc`)
  - [ ] Semantic HTML استفاده شده (`<button>` نه `<div>`)?
  - [ ] `aria-label` برای icon-only buttons؟
  - [ ] Keyboard navigation کار می‌کند؟
  - [ ] Focus indicators واضح هستند؟
  - [ ] Color contrast حداقل 4.5:1 است؟

- [ ] **User Feedback** (`ui-ux/user-feedback.mdc`)
  - [ ] Loading states برای async operations؟
  - [ ] Error handling با پیام‌های واضح؟
  - [ ] Success feedback برای actions مهم؟
  - [ ] Toast notifications برای feedback سریع؟

## 💻 Frontend Patterns

- [ ] **Component Patterns** (`frontend/component-patterns.mdc`)
  - [ ] ترتیب استاندارد: Imports → Props → State → Reactive → Lifecycle → Handlers
  - [ ] Props type-safe هستند (TypeScript/JSDoc)?
  - [ ] Events با `createEventDispatcher`؟

- [ ] **Reactivity** (`frontend/reactivity.mdc`)
  - [ ] از Svelte 5 Runes استفاده شده (`$state`, `$derived`, `$effect`)?
  - [ ] Reactive declarations بهینه هستند؟
  - [ ] از derived stores برای computed values استفاده شده؟

- [ ] **State Management** (`state/state-management.mdc`)
  - [ ] Local state برای component-specific state؟
  - [ ] Global state در stores؟
  - [ ] Single Source of Truth رعایت شده؟
  - [ ] Immutable updates استفاده شده؟

## ⚡ Performance

- [ ] **Bundle Size** (`performance/bundle-size.mdc`)
  - [ ] Initial JS bundle < 170KB (gzipped)?
  - [ ] از code splitting استفاده شده؟
  - [ ] از dynamic imports برای lazy loading؟

- [ ] **Core Web Vitals** (`performance/core-web-vitals.mdc`)
  - [ ] LCP < 2.5s?
  - [ ] FID < 100ms?
  - [ ] CLS < 0.1?

- [ ] **Runtime** (`performance/runtime.mdc`)
  - [ ] از debouncing برای search/input استفاده شده؟
  - [ ] از virtual scrolling برای لیست‌های بزرگ؟
  - [ ] از memoization برای expensive computations؟

## 🧪 Testing

- [ ] **Testing Strategy** (`testing/strategy.mdc`)
  - [ ] Unit tests برای utilities و stores؟
  - [ ] Component tests برای کامپوننت‌های مهم؟
  - [ ] E2E tests برای user flows اصلی؟

## 🔧 Code Quality

- [ ] **Code Quality** (`core/code-quality.mdc`)
  - [ ] TypeScript errors وجود ندارد؟
  - [ ] ESLint errors وجود ندارد؟
  - [ ] Code formatted با Prettier؟
  - [ ] No console.log در production code؟

- [ ] **Git Workflow** (`core/git-workflow.mdc`)
  - [ ] Commit message مطابق با format است؟
  - [ ] Branch name مناسب است؟
  - [ ] PR description کامل است؟

## 📝 Documentation

- [ ] JSDoc برای functions پیچیده؟
- [ ] Comments برای منطق پیچیده؟
- [ ] README به‌روزرسانی شده (در صورت نیاز)؟

---

**نکته:** اگر موردی رعایت نشده، در PR comment مشخص کنید و راه حل پیشنهاد دهید.
