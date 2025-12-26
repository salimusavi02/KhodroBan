import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Select from '../Select.svelte';
import type { SelectOption } from '$lib/types';

const mockOptions: SelectOption[] = [
  { value: '1', label: 'گزینه ۱' },
  { value: '2', label: 'گزینه ۲' },
  { value: '3', label: 'گزینه ۳' },
];

test('renders select with label', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب کنید',
      name: 'select',
      options: mockOptions
    } 
  });
  expect(screen.getByLabelText(/انتخاب کنید/)).toBeInTheDocument();
});

test('displays all options', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions
    } 
  });
  
  expect(screen.getByText(/گزینه ۱/)).toBeInTheDocument();
  expect(screen.getByText(/گزینه ۲/)).toBeInTheDocument();
  expect(screen.getByText(/گزینه ۳/)).toBeInTheDocument();
});

test('handles option selection', async () => {
  const user = userEvent.setup();
  let selectedValue = '';
  
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions,
      onchange: (value: string) => {
        selectedValue = value;
      }
    } 
  });
  
  const select = screen.getByLabelText(/انتخاب/) as HTMLSelectElement;
  await user.selectOptions(select, '2');
  
  expect(selectedValue).toBe('2');
});

test('displays error message when error prop is provided', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions,
      error: 'لطفا یک گزینه انتخاب کنید'
    } 
  });
  expect(screen.getByText(/لطفا یک گزینه انتخاب کنید/)).toBeInTheDocument();
});

test('shows required mark when required prop is true', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions,
      required: true
    } 
  });
  expect(screen.getByText('*')).toBeInTheDocument();
});

test('disables select when disabled prop is true', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions,
      disabled: true
    } 
  });
  expect(screen.getByLabelText(/انتخاب/)).toBeDisabled();
});

test('displays placeholder when provided', () => {
  render(Select, { 
    props: { 
      label: 'انتخاب',
      name: 'select',
      options: mockOptions,
      placeholder: 'لطفا انتخاب کنید...'
    } 
  });
  expect(screen.getByText(/لطفا انتخاب کنید.../)).toBeInTheDocument();
});

