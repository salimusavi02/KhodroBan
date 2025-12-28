# KhodroBan - AI Agent Instructions

This document provides essential guidance for AI coding agents working on the KhodroBan project - a Persian car maintenance management web application.

## 🏗️ Project Architecture

### Big Picture
KhodroBan is a **Svelte 5 + TypeScript** web application built with **Vite + SvelteKit**. The project follows a **service-based architecture** with clear separation between UI components, business logic services, and data layers. It's a **monorepo** with both frontend and backend components.

### Core Structure
```
KhodroBan/
├── frontend/               # Svelte 5 + TypeScript + Vite
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/     # Atomic Design: common/, layout/, features/
│   │   │   ├── services/       # API layer with mock + Supabase implementations
│   │   │   ├── stores/         # Svelte 5 runes-based state management
│   │   │   ├── types/          # Centralized TypeScript interfaces
│   │   │   ├── utils/          # Helpers, validation, config
│   │   │   └── i18n/           # Persian/English localization
│   │   ├── routes/             # SvelteKit pages
│   │   └── test/               # Vitest tests (smoke, components, routes)
│   └── .cursor/rules/         # AI coding rules for frontend
├── backend/                # Django REST API (future)
├── supabase/               # Database migrations and config
├── docs/                   # Technical and product documentation
└── .github/                # CI/CD workflows
```

### Key Design Decisions

1. **Dual Backend Support**: Services work with **Supabase** or **Mock Data**
   - Controlled by `VITE_BACKEND_TYPE` environment variable
   - **Default**: `supabase` (production-ready)
   - **Development**: Use `mock` for offline development
   - Each service exports both implementations via `selectService()` router

2. **Svelte 5 Runes**: Modern reactive state management
   - `$state()` for reactive variables
   - `$derived()` for computed values
   - `$effect()` for side effects
   - `$props()` for component props
   - **Critical**: No `let` + `export` patterns

3. **Persian-First Design**: 
   - RTL layout support
   - Jalali (Persian) date handling via `persian-date`
   - Vazirmatn font for Persian text
   - All UI text in Persian by default

4. **Service-Based Architecture**:
   - **Pattern**: Mock + Supabase implementations per service
   - **Router**: `selectService()` chooses implementation at runtime
   - **Types**: Centralized in `src/lib/types/index.ts`
   - **Interfaces**: Defined in `src/lib/services/base/types.ts`

## 🔧 Critical Developer Workflows

### Development Setup
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:5173
```

### Environment Configuration
Create `.env` file in `frontend/`:
```env
VITE_BACKEND_TYPE=mock  # or 'supabase' for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=خودروبان
```

### Testing Strategy
```bash
# Quick smoke tests (2 seconds) - use during development
npm run test:smoke

# Component tests
npm run test:components

# All tests
npm run test

# Type checking
npm run check

# Linting
npm run lint

# Format check
npm run format:check

# Full validation (check + lint + format)
npm run validate
```

### Build & Deploy
```bash
# Standard build
npm run build

# GitHub Pages build (Chabokan deployment)
npm run chabokan:build

# Preview build
npm run preview
```

## 🎯 Project-Specific Conventions

### 1. Service Pattern (CRITICAL)
All services follow this exact pattern:

```typescript
// src/lib/services/vehicleService.ts
import { supabase } from '../supabase';
import type { Vehicle, VehicleFormData } from '../types';
import { selectService } from './base/router';
import type { IVehicleService } from './base/types';

// MOCK IMPLEMENTATION
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    userId: '1',
    model: 'پژو ۲۰۶',
    year: 1398,
    plateNumber: '۱۲ب۳۴۵ - ۷۸',
    currentKm: 85000,
    note: 'خودروی اصلی',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

const vehicleServiceMock: IVehicleService = {
  async getAll(): Promise<Vehicle[]> {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network
    return [...mockVehicles];
  },
  async create(data: VehicleFormData): Promise<Vehicle> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      userId: '1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockVehicles.push(newVehicle);
    return newVehicle;
  },
  // ... other methods
};

// SUPABASE IMPLEMENTATION  
const vehicleServiceSupabase: IVehicleService = {
  async getAll(): Promise<Vehicle[]> {
    if (!supabase) throw new Error('Supabase client not available');
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    return data;
  },
  async create(data: VehicleFormData): Promise<Vehicle> {
    if (!supabase) throw new Error('Supabase client not available');
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return vehicle;
  },
  // ... other methods
};

// EXPORT with router selection
export const vehicleService = selectService<IVehicleService>(
  vehicleServiceMock,
  vehicleServiceSupabase
);
```

### 2. Type Definitions
All types are centralized in `src/lib/types/index.ts`:

```typescript
export interface Vehicle {
  id: string;
  userId: string;
  model: string;
  year: number;
  plateNumber: string;
  currentKm: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  model: string;
  year: number;
  plateNumber: string;
  currentKm: number;
  note?: string;
}

export type ServiceType = 'oil_change' | 'filter' | 'brakes' | 'other';
export type ExpenseCategory = 'fuel' | 'wash' | 'parking' | 'toll' | 'minor_repair' | 'other';
```

### 3. Svelte 5 Component Props
Use TypeScript interfaces with `$props()`:

```typescript
// src/lib/components/ui/Button.svelte
<script lang="ts">
  type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  type ButtonSize = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: string;
    class?: string;
    onclick?: () => void;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon = '',
    class: className = '',
    onclick,
  }: Props = $props();

  function handleClick() {
    if (!disabled && !loading) {
      onclick?.();
    }
  }
</script>

<button
  {type}
  class="btn btn-{variant} btn-{size} {className}"
  class:btn-full={fullWidth}
  class:btn-loading={loading}
  disabled={disabled || loading}
  onclick={handleClick}
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  <slot />
</button>
```

### 4. Accessibility Requirements (WCAG 2.1 AA)
- **All interactive elements** must have keyboard handlers
- **ARIA labels** for screen readers
- **Semantic HTML** elements
- **Focus management** for modals
- **Color contrast** minimum 4.5:1 for text
- **Touch targets** minimum 44×44px

### 5. CSS & Styling
- **Glassmorphism** design system
- CSS variables for theming
- **Mobile-first** responsive design
- Utility classes for common patterns
- No inline styles

### 6. State Management
- **Local state**: Use `$state()` in components
- **Global state**: Use Svelte stores in `src/lib/stores/`
- **Derived state**: Use `$derived()` for computed values
- **Side effects**: Use `$effect()` for reactive side effects

## 🔌 Integration Points

### Supabase Integration
- **URL**: `VITE_SUPABASE_URL`
- **Anon Key**: `VITE_SUPABASE_ANON_KEY`
- **Tables**: 
  - `user_profiles` - User profile data
  - `user_subscriptions` - Subscription status
  - `subscription_plans` - Pricing plans
  - `vehicles` - Vehicle records
  - `services` - Service records
  - `expenses` - Expense records
- **Auth**: JWT-based with Google OAuth support
- **RLS**: Row-level security enabled

### External Dependencies
- `@supabase/supabase-js` - Database & Auth
- `axios` - HTTP client (for custom API)
- `persian-date` - Jalali date handling
- `svelte-i18n` - Internationalization
- `chart.js` - Data visualization

## ⚠️ Current Technical Debt (Priority Order)

### 1. Type Safety Issues (HIGH)
- **80+** `any` types in services (authService, expenseService, etc.)
- **30+** unused variables
- **45+** TypeScript errors in type checking
- **Action**: Define proper interfaces, remove unused variables

### 2. Svelte 5 Migration (HIGH)
- **15+** deprecated `<slot>` usages (need `{@render}` tags)
- **10+** accessibility warnings
- **15+** unused CSS selectors
- **Action**: Update to Svelte 5 syntax, fix accessibility

### 3. CI/CD Configuration (MEDIUM)
- Checks are currently **non-blocking** (`continue-on-error: true`)
- **Action**: Fix all errors, then remove `continue-on-error`

### 4. Test Infrastructure (MEDIUM)
- Missing `@testing-library/user-event` dependency
- Missing `svelte-i18n` dependency
- Mock implementations need proper type definitions
- **Action**: Install dependencies, improve test coverage

## 📋 Development Checklist

### Before Committing (MANDATORY)
1. ✅ **Type Check**: `npm run check` - fix all TypeScript errors
2. ✅ **Lint**: `npm run lint` - fix all ESLint warnings
3. ✅ **Tests**: `npm run test` - ensure all tests pass
4. ✅ **Format**: `npm run format:check` - verify formatting
5. ✅ **Smoke Tests**: `npm run test:smoke` - quick validation

### Adding New Features
1. **Define types** in `src/lib/types/index.ts`
2. **Create service** in `src/lib/services/` with mock + Supabase
3. **Build UI** components in `src/lib/components/`
4. **Add routes** in `src/routes/`
5. **Write tests** in `src/lib/components/__tests__/`
6. **Update documentation** in `docs/`

### Fixing Existing Issues
1. **Unused variables**: Prefix with `_` or remove completely
2. **`any` types**: Define proper interfaces in `types/index.ts`
3. **Deprecated slots**: Use `{@render children()}` syntax
4. **Accessibility**: Add ARIA attributes and keyboard handlers
5. **Unused CSS**: Remove or use in components

## 🎯 Success Metrics

- **Type Safety**: 0 TypeScript errors
- **Code Quality**: 0 ESLint warnings
- **Test Coverage**: All critical paths tested
- **Performance**: < 2s build time, < 100ms page loads
- **Accessibility**: WCAG 2.1 AA compliance
- **Bundle Size**: <170KB gzipped per route

## 🔗 Key Files Reference

### Configuration
- `frontend/vite.config.ts` - Build configuration
- `frontend/tsconfig.json` - TypeScript config
- `frontend/.eslintrc.cjs` - ESLint rules
- `frontend/package.json` - Dependencies and scripts

### Core Source Files
- `frontend/src/lib/types/index.ts` - All TypeScript interfaces
- `frontend/src/lib/services/` - All services (auth, vehicle, expense, etc.)
- `frontend/src/lib/services/base/router.ts` - Service router
- `frontend/src/lib/services/base/types.ts` - Service interfaces
- `frontend/src/lib/config/backendConfig.ts` - Backend configuration

### UI Components
- `frontend/src/lib/components/ui/` - Primitives (Button, Input, Card, etc.)
- `frontend/src/lib/components/layout/` - Layout components
- `frontend/src/lib/components/features/` - Feature-specific components

### Testing
- `frontend/src/test/smoke/` - Quick smoke tests
- `frontend/src/lib/components/__tests__/` - Component tests
- `frontend/src/test/setup-tests.ts` - Test setup

### CI/CD & Documentation
- `.github/workflows/ci-frontend.yml` - CI workflow
- `frontend/TODO.md` - Current issues and priorities
- `docs/technical/` - Technical documentation

## 💡 Pro Tips

1. **Mock Mode First**: Always develop with `VITE_BACKEND_TYPE=mock` first
2. **Svelte 5 Runes**: Use `$state()`, `$derived()`, `$effect()` - never `let` + `export`
3. **Persian Dates**: Always use `persian-date` library for all date operations
4. **Quick Testing**: Use `test:smoke` for 2-second feedback during development
5. **Service Pattern**: Follow the exact mock + Supabase pattern in all services
6. **Git Workflow**: Follow `frontend/.cursor/rules/core/git-workflow.mdc`
7. **Type Safety**: Never use `any` - always define proper interfaces
8. **Accessibility**: Test with keyboard only - no mouse/touch

## 🚨 Common Pitfalls to Avoid

1. **❌ Don't use `let` + `export` for props** - Use `$props()` with interface
2. **❌ Don't use `<slot>`** - Use `{@render children()}` in Svelte 5
3. **❌ Don't use `any` types** - Define proper interfaces
4. **❌ Don't skip error handling** - Always catch Supabase errors
5. **❌ Don't use inline styles** - Use CSS classes and variables
6. **❌ Don't ignore accessibility** - WCAG 2.1 AA is mandatory
7. **❌ Don't commit without testing** - Run `npm run validate` first

---

**Last Updated**: 2025-12-28  
**Project Status**: MVP Development - Active  
**Next Milestone**: Fix CI blocking checks (TypeScript errors, ESLint warnings)  
**Backend Type**: Supabase (default) / Mock (development)