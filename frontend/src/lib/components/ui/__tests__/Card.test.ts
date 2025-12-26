import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import Card from '../Card.svelte';

test('renders card with content', () => {
  const { container } = render(Card, { props: {} });
  // بررسی اینکه ساختار card render شده است
  expect(container.querySelector('.card')).toBeInTheDocument();
  expect(container.querySelector('.card-body')).toBeInTheDocument();
});

test('displays title when provided', () => {
  render(Card, { props: { title: 'عنوان', children: 'محتوا' } });
  expect(screen.getByText(/عنوان/)).toBeInTheDocument();
});

test('displays subtitle when provided', () => {
  render(Card, { props: { subtitle: 'زیرعنوان', children: 'محتوا' } });
  expect(screen.getByText(/زیرعنوان/)).toBeInTheDocument();
});

test('calls onclick when clickable and clicked', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(Card, {
    props: {
      clickable: true,
      onclick: handleClick,
      children: 'کارد قابل کلیک',
    },
  });

  const card = screen.getByRole('button');
  await user.click(card);

  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('renders with different variants', () => {
  const { container: defaultCard } = render(Card, {
    props: { variant: 'default', children: 'پیش‌فرض' },
  });
  expect(defaultCard.querySelector('.card-default')).toBeInTheDocument();

  const { container: solidCard } = render(Card, {
    props: { variant: 'solid', children: 'ساده' },
  });
  expect(solidCard.querySelector('.card-solid')).toBeInTheDocument();

  const { container: outlineCard } = render(Card, {
    props: { variant: 'outline', children: 'خط دار' },
  });
  expect(outlineCard.querySelector('.card-outline')).toBeInTheDocument();
});

test('renders with different padding sizes', () => {
  const { container: smCard } = render(Card, {
    props: { padding: 'sm', children: 'کوچک' },
  });
  expect(smCard.querySelector('.card-padding-sm')).toBeInTheDocument();

  const { container: mdCard } = render(Card, {
    props: { padding: 'md', children: 'متوسط' },
  });
  expect(mdCard.querySelector('.card-padding-md')).toBeInTheDocument();

  const { container: lgCard } = render(Card, {
    props: { padding: 'lg', children: 'بزرگ' },
  });
  expect(lgCard.querySelector('.card-padding-lg')).toBeInTheDocument();
});

test('has hoverable class when hoverable is true', () => {
  const { container } = render(Card, {
    props: { hoverable: true, children: 'قابل hover' },
  });
  expect(container.querySelector('.hoverable')).toBeInTheDocument();
});

test('has clickable role when clickable is true', () => {
  render(Card, { props: { clickable: true, children: 'قابل کلیک' } });
  expect(screen.getByRole('button')).toBeInTheDocument();
});
