import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import Button from '../Button.svelte';

test('renders button with text', () => {
  render(Button, { props: { children: 'کلیک کنید' } });
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('calls onclick handler when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(Button, { 
    props: { 
      children: 'کلیک',
      onclick: handleClick
    } 
  });
  
  const button = screen.getByRole('button');
  await user.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('disables button when disabled prop is true', () => {
  render(Button, { props: { disabled: true, children: 'غیرفعال' } });
  expect(screen.getByRole('button')).toBeDisabled();
});

test('disables button when loading prop is true', () => {
  render(Button, { props: { loading: true, children: 'در حال بارگذاری' } });
  expect(screen.getByRole('button')).toBeDisabled();
});

test('does not call onclick when disabled', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(Button, { 
    props: { 
      children: 'غیرفعال',
      disabled: true,
      onclick: handleClick
    } 
  });
  
  const button = screen.getByRole('button');
  await user.click(button);
  
  expect(handleClick).not.toHaveBeenCalled();
});

test('renders with different variants', () => {
  const { container: primaryContainer } = render(Button, { 
    props: { variant: 'primary', children: 'اولیه' } 
  });
  expect(primaryContainer.querySelector('.btn-primary')).toBeInTheDocument();
  
  const { container: secondaryContainer } = render(Button, { 
    props: { variant: 'secondary', children: 'ثانویه' } 
  });
  expect(secondaryContainer.querySelector('.btn-secondary')).toBeInTheDocument();
});

test('renders with icon', () => {
  const { container } = render(Button, { 
    props: { icon: '🔍', children: 'جستجو' } 
  });
  expect(container.querySelector('.btn-icon')).toBeInTheDocument();
});

