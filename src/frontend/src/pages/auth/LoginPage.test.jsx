import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { ApiError } from '../../api/client';
import { ThemeProvider } from '../../context/ThemeContext';

const login = vi.fn();
const toastSuccess = vi.fn();
const navigate = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    success: toastSuccess,
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

function renderLogin() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
    toastSuccess.mockReset();
    navigate.mockReset();
  });

  it('shows client-side validation errors when fields are empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects on success', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ name: 'Alice Admin', role: 'admin' });
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'Password123!',
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith('Welcome back, Alice Admin!');
    expect(navigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
  });

  it('surfaces API form errors', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new ApiError('Invalid credentials', 401));
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
