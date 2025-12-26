// تست‌های Smoke برای صفحات
// این تست‌ها فقط بررسی می‌کنند که صفحات بدون crash render می‌شوند
//
// توجه: تست‌های صفحات به دلیل وابستگی‌های زیاد (stores, services, etc)
// نیاز به mock های کامل دارند که در setup-tests.ts تعریف شده‌اند.
// فعلاً فقط برای صفحات ساده‌تر (login, register) تست نوشته شده است.
// صفحات پیچیده‌تر (dashboard, add, vehicles) نیاز به mock های بیشتری دارند.

import { render } from '@testing-library/svelte';
import { describe, test } from 'vitest';

// صفحات ساده‌تر که وابستگی کمتری دارند
import LoginPage from '../../routes/login/+page.svelte';
import RegisterPage from '../../routes/register/+page.svelte';

describe('Page Smoke Tests', () => {
  test('Login page renders without crashing', () => {
    render(LoginPage);
    // اگر render شود بدون خطا، تست pass می‌شود
  });

  test('Register page renders without crashing', () => {
    render(RegisterPage);
    // اگر render شود بدون خطا، تست pass می‌شود
  });

  // صفحات پیچیده‌تر که نیاز به mock های بیشتری دارند
  // فعلاً skip شده‌اند و می‌توانند بعداً فعال شوند
  test.skip('Add page renders without crashing', () => {
    // TODO: نیاز به mock کامل stores و services
    // import AddPage from '../../routes/add/+page.svelte';
    // render(AddPage);
  });

  test.skip('Dashboard page renders without crashing', () => {
    // TODO: نیاز به mock کامل stores و services
    // import DashboardPage from '../../routes/dashboard/+page.svelte';
    // render(DashboardPage);
  });

  test.skip('Settings page renders without crashing', () => {
    // TODO: نیاز به mock کامل stores و services
    // import SettingsPage from '../../routes/settings/+page.svelte';
    // render(SettingsPage);
  });

  test.skip('Vehicles page renders without crashing', () => {
    // TODO: نیاز به mock کامل stores و services
    // import VehiclesPage from '../../routes/vehicles/+page.svelte';
    // render(VehiclesPage);
  });
});
