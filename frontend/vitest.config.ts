/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
  // @ts-expect-error - sveltekit() returns a Promise but works fine in practice
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup-tests.ts'],
    // اجرای موازی تست‌ها برای سرعت بیشتر
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    // Timeout کوتاه برای تست‌های سریع
    testTimeout: 2000,
    // فقط تست‌های مرتبط را اجرا کن (در watch mode)
    watchExclude: ['**/node_modules/**', '**/build/**'],
    // تنظیمات خاص برای Svelte
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    // تنظیمات محیط تست برای جلوگیری از مشکلات SSR
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173',
        // مشخص کردن اینکه محیط SPA هست
        pretendToBeVisual: true,
        resources: 'usable',
      },
    },
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $components: path.resolve('./src/lib/components'),
      $stores: path.resolve('./src/lib/stores'),
      $services: path.resolve('./src/lib/services'),
      $utils: path.resolve('./src/lib/utils'),
    },
    // اطمینان از استفاده از client-side Svelte در تست‌ها
    conditions: ['browser', 'development'],
  },
  // تنظیمات خاص برای Svelte در تست‌ها
  define: {
    // غیرفعال کردن SSR در تست‌ها
    'import.meta.env.SSR': 'false',
  },
  // غیرفعال کردن SSR در تست‌ها
  ssr: {
    noExternal: ['@testing-library/svelte'],
  },
});

