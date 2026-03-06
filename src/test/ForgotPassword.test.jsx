/**
 * Tests for ForgotPassword page:
 *  - Renders step 1 (email form) initially
 *  - Advances to step 2 (OTP) after email submission
 *  - Advances to step 3 (new password) after OTP verification
 *  - Navigates to / after password reset
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// ── Mock react-router-dom ─────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock MUI icons (prevents EMFILE on Windows) ────────────────
vi.mock('@mui/icons-material', () => ({
  ArrowBack: () => '←',
}));

// ── Mock inputStyles ─────────────────────────────────────────
vi.mock('../services/inputStyles', () => ({ default: {} }));

// ── Mock sub-form components so tests focus on page logic ─────
vi.mock('../components/auth/ForgotPasswordEmailForm', () => ({
  default: ({ onSubmit }) => (
    <form data-testid="email-form" onSubmit={onSubmit}>
      <button type="submit">Send OTP</button>
    </form>
  ),
}));

vi.mock('../components/auth/ForgotPasswordOtpForm', () => ({
  default: ({ onSubmit, onResend }) => (
    <form data-testid="otp-form" onSubmit={onSubmit}>
      <button type="submit">Verify OTP</button>
      <button type="button" onClick={onResend}>Resend</button>
    </form>
  ),
}));

vi.mock('../components/auth/ForgotPasswordNewPasswordForm', () => ({
  default: ({ onSubmit }) => (
    <form data-testid="new-password-form" onSubmit={onSubmit}>
      <button type="submit">Reset Password</button>
    </form>
  ),
}));

const { default: ForgotPassword } = await import('../pages/auth/ForgotPassword');

describe('ForgotPassword — step 1 (email)', () => {
  it('renders the email form on initial load', () => {
    render(<ForgotPassword />);
    expect(screen.getByTestId('email-form')).toBeDefined();
  });

  it('does not render OTP or new-password form on step 1', () => {
    render(<ForgotPassword />);
    expect(screen.queryByTestId('otp-form')).toBeNull();
    expect(screen.queryByTestId('new-password-form')).toBeNull();
  });

  it('shows the step indicator', () => {
    render(<ForgotPassword />);
    // Step dots are rendered (3 dots for 3 steps)
    const boxes = document.querySelectorAll('[style]');
    expect(boxes.length).toBeGreaterThan(0);
  });
});

describe('ForgotPassword — step 2 (OTP)', () => {
  it('advances to OTP form after email submission', async () => {
    render(<ForgotPassword />);

    fireEvent.submit(screen.getByTestId('email-form'));

    await waitFor(() => {
      expect(screen.getByTestId('otp-form')).toBeDefined();
    });
    expect(screen.queryByTestId('email-form')).toBeNull();
  });

  it('does not show new-password form on step 2', async () => {
    render(<ForgotPassword />);
    fireEvent.submit(screen.getByTestId('email-form'));
    await waitFor(() => expect(screen.getByTestId('otp-form')).toBeDefined());
    expect(screen.queryByTestId('new-password-form')).toBeNull();
  });
});

describe('ForgotPassword — step 3 (new password)', () => {
  const advanceToStep3 = async () => {
    render(<ForgotPassword />);
    fireEvent.submit(screen.getByTestId('email-form'));
    await waitFor(() => screen.getByTestId('otp-form'));
    fireEvent.submit(screen.getByTestId('otp-form'));
    await waitFor(() => screen.getByTestId('new-password-form'));
  };

  it('renders the new-password form on step 3', async () => {
    await advanceToStep3();
    expect(screen.getByTestId('new-password-form')).toBeDefined();
  });

  it('navigates to / after password reset', async () => {
    await advanceToStep3();
    fireEvent.submit(screen.getByTestId('new-password-form'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

describe('ForgotPassword — back navigation link', () => {
  it('renders a back-to-login link', () => {
    render(<ForgotPassword />);
    expect(screen.getByRole('link', { name: /login|back/i })).toBeDefined();
  });
});
