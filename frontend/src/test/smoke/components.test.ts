// تست‌های Smoke برای کامپوننت‌های UI
// این تست‌ها فقط بررسی می‌کنند که کامپوننت‌ها بدون crash render می‌شوند

import { render } from '@testing-library/svelte';
import { describe, test } from 'vitest';
import Button from '$lib/components/ui/Button.svelte';
import Input from '$lib/components/ui/Input.svelte';
import Select from '$lib/components/ui/Select.svelte';
import Card from '$lib/components/ui/Card.svelte';
import Modal from '$lib/components/ui/Modal.svelte';
import Badge from '$lib/components/ui/Badge.svelte';
import Tabs from '$lib/components/ui/Tabs.svelte';
import Toast from '$lib/components/ui/Toast.svelte';
import Spinner from '$lib/components/ui/Spinner.svelte';
import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
import Skeleton from '$lib/components/ui/Skeleton.svelte';
import EmptyState from '$lib/components/ui/EmptyState.svelte';

describe('Component Smoke Tests', () => {
  test('Button renders without crashing', () => {
    render(Button, { props: { children: 'تست' } });
  });

  test('Input renders without crashing', () => {
    render(Input, { props: { label: 'تست', name: 'test' } });
  });

  test('Select renders without crashing', () => {
    render(Select, {
      props: {
        options: [{ value: '1', label: 'گزینه ۱' }],
        name: 'test',
      },
    });
  });

  test('Card renders without crashing', () => {
    render(Card, { props: { children: 'محتوا' } });
  });

  test('Modal renders without crashing', () => {
    render(Modal, { props: { open: false, title: 'تست' } });
  });

  test('Badge renders without crashing', () => {
    render(Badge, { props: { children: 'تست' } });
  });

  test('Tabs renders without crashing', () => {
    render(Tabs, {
      props: {
        tabs: [
          { id: '1', label: 'تب ۱' },
          { id: '2', label: 'تب ۲' },
        ],
      },
    });
  });

  test('Toast renders without crashing', () => {
    render(Toast, {
      props: {
        message: 'پیام تست',
        type: 'success',
      },
    });
  });

  test('Spinner renders without crashing', () => {
    render(Spinner);
  });

  test('LoadingSpinner renders without crashing', () => {
    render(LoadingSpinner);
  });

  test('Skeleton renders without crashing', () => {
    render(Skeleton);
  });

  test('EmptyState renders without crashing', () => {
    render(EmptyState, {
      props: {
        title: 'خالی است',
        message: 'هیچ آیتمی وجود ندارد',
      },
    });
  });
});
