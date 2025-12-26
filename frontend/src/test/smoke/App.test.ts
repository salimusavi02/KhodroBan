// تست Smoke برای App
// این تست فعلاً skip شده است

import { render } from '@testing-library/svelte';
import { describe, test } from 'vitest';
import Button from '../../lib/components/ui/Button.svelte';

describe('App Smoke Test', () => {
  test.skip('Button component renders without crashing', () => {
    render(Button, {
      props: { children: 'Click me' },
    });
    // اگر render شود بدون خطا، تست pass می‌شود
  });
});
