import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Input from '../Input.svelte';

test('renders input with label', () => {
  render(Input, { props: { label: 'نام', name: 'name' } });
  expect(screen.getByLabelText(/نام/)).toBeInTheDocument();
});

test('displays error message when error prop is provided', () => {
  render(Input, { 
    props: { 
      label: 'ایمیل', 
      name: 'email',
      error: 'این فیلد الزامی است'
    } 
  });
  expect(screen.getByText(/این فیلد الزامی است/)).toBeInTheDocument();
});

test('displays hint message when hint prop is provided', () => {
  render(Input, { 
    props: { 
      label: 'نام کاربری', 
      name: 'username',
      hint: 'حداقل 3 کاراکتر'
    } 
  });
  expect(screen.getByText(/حداقل 3 کاراکتر/)).toBeInTheDocument();
});

test('handles input value changes', async () => {
  const user = userEvent.setup();
  let value = '';
  
  render(Input, { 
    props: { 
      label: 'نام',
      name: 'name',
      oninput: (e: Event) => {
        value = (e.target as HTMLInputElement).value;
      }
    } 
  });
  
  const input = screen.getByLabelText(/نام/) as HTMLInputElement;
  await user.type(input, 'تست');
  
  expect(value).toBe('تست');
});

test('shows required mark when required prop is true', () => {
  render(Input, { 
    props: { 
      label: 'نام', 
      name: 'name',
      required: true
    } 
  });
  expect(screen.getByText('*')).toBeInTheDocument();
});

test('disables input when disabled prop is true', () => {
  render(Input, { props: { label: 'نام', name: 'name', disabled: true } });
  expect(screen.getByLabelText(/نام/)).toBeDisabled();
});

test('renders with icon when icon prop is provided', () => {
  const { container } = render(Input, { 
    props: { 
      label: 'جستجو', 
      name: 'search',
      icon: '🔍'
    } 
  });
  expect(container.querySelector('.input-icon')).toBeInTheDocument();
});

test('supports different input types', () => {
  const { container: textInput } = render(Input, { 
    props: { label: 'متن', name: 'text', type: 'text' } 
  });
  expect(textInput.querySelector('input[type="text"]')).toBeInTheDocument();
  
  const { container: emailInput } = render(Input, { 
    props: { label: 'ایمیل', name: 'email', type: 'email' } 
  });
  expect(emailInput.querySelector('input[type="email"]')).toBeInTheDocument();
  
  const { container: passwordInput } = render(Input, { 
    props: { label: 'رمز عبور', name: 'password', type: 'password' } 
  });
  expect(passwordInput.querySelector('input[type="password"]')).toBeInTheDocument();
});

