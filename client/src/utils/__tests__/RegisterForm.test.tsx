import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/helpers';
import RegisterForm from '../../features/auth/components/RegisterForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../utils/tokenStorage', () => ({
  tokenStorage: {
    getAccess: vi.fn(() => null),
    setAccess: vi.fn(),
    setRefresh: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all fields', () => {
    renderWithProviders(<RegisterForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText('Name'), 'Yashika');
    await user.type(screen.getByLabelText('Email'), 'yashika@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'different123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText('Name'), 'Yashika');
    await user.type(screen.getByLabelText('Email'), 'yashika@test.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.type(screen.getByLabelText('Confirm Password'), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });
  });

  it('shows error when email already in use', async () => {
    server.use(
      http.post('http://localhost/api/v1/auth/register', () => {
        return HttpResponse.json({
          success: false,
          message: 'Email already in use',
        }, { status: 409 });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText('Name'), 'Yashika');
    await user.type(screen.getByLabelText('Email'), 'existing@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('registers successfully and redirects', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText('Name'), 'Yashika');
    await user.type(screen.getByLabelText('Email'), 'yashika@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});