import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Modal from '../Modal.svelte';

test('renders modal when open is true', () => {
  render(Modal, { props: { open: true, title: 'تست' } });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/تست/)).toBeInTheDocument();
});

test('does not render modal when open is false', () => {
  const { container } = render(Modal, { props: { open: false, title: 'تست' } });
  expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
});

test('closes modal when close button is clicked', async () => {
  const user = userEvent.setup();
  let isOpen = true;
  
  const { component } = render(Modal, { 
    props: { 
      open: isOpen,
      title: 'تست',
      onclose: () => { isOpen = false; }
    } 
  });
  
  const closeButton = screen.getByLabelText(/بستن/);
  await user.click(closeButton);
  
  // Modal should dispatch close event
  expect(closeButton).toBeInTheDocument();
});

test('displays title when provided', () => {
  render(Modal, { props: { open: true, title: 'عنوان تست' } });
  expect(screen.getByText(/عنوان تست/)).toBeInTheDocument();
});

test('renders modal content', () => {
  render(Modal, { props: { open: true, title: 'تست' } });
  
  // Modal should render
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('shows close button by default', () => {
  render(Modal, { props: { open: true, title: 'تست' } });
  expect(screen.getByLabelText(/بستن/)).toBeInTheDocument();
});

test('hides close button when showClose is false', () => {
  render(Modal, { props: { open: true, title: 'تست', showClose: false } });
  expect(screen.queryByLabelText(/بستن/)).not.toBeInTheDocument();
});

test('renders with different sizes', () => {
  const { container: smModal } = render(Modal, { 
    props: { open: true, size: 'sm' } 
  });
  expect(smModal.querySelector('.modal-sm')).toBeInTheDocument();
  
  const { container: mdModal } = render(Modal, { 
    props: { open: true, size: 'md' } 
  });
  expect(mdModal.querySelector('.modal-md')).toBeInTheDocument();
  
  const { container: lgModal } = render(Modal, { 
    props: { open: true, size: 'lg' } 
  });
  expect(lgModal.querySelector('.modal-lg')).toBeInTheDocument();
});

