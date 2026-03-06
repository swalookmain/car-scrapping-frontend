/**
 * Tests for NotFound (404) page:
 *  - Renders 404 text
 *  - Shows Go Home button
 *  - Navigates to dashboard for authenticated users
 *  - Navigates to / for unauthenticated users
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// ── Mock react-router-dom ─────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock AuthContext ───────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Mock roleConfig ────────────────────────────────────────────
vi.mock('../config/roleConfig', () => ({
  getDefaultRoute: (role) => (role === 'ADMIN' ? '/dashboard' : '/super-admin'),
  isRouteAllowed: vi.fn().mockReturnValue(true),
  ROLES: { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', STAFF: 'STAFF' },
  ROUTE_CONFIG: [],
  SIDEBAR_CONFIG: [],
  getFilteredSidebarConfig: vi.fn().mockReturnValue([]),
}));

// ── Mock MUI icon ─────────────────────────────────────────────
vi.mock('@mui/icons-material/ErrorOutline', () => ({ default: () => '⚠️' }));

const { default: NotFound } = await import('../pages/NotFound');

describe('NotFound — rendering', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false });
    mockNavigate.mockReset();
  });

  it('renders 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeDefined();
  });

  it('renders a descriptive message', () => {
    render(<NotFound />);
    // Should contain "not found" or "page" somewhere
    const text = document.body.textContent.toLowerCase();
    expect(text).toMatch(/page|found|exist/);
  });

  it('renders a Go Home button', () => {
    render(<NotFound />);
    expect(
      screen.getByRole('button', { name: /home|back|dashboard|return/i })
    ).toBeDefined();
  });
});

describe('NotFound — navigation', () => {
  it('navigates to / when user is NOT authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false });
    render(<NotFound />);

    const homeBtn = screen.getByRole('button', { name: /home|back|dashboard|return/i });
    await userEvent.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('navigates to dashboard when ADMIN is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
      isAuthenticated: true,
    });
    render(<NotFound />);

    const homeBtn = screen.getByRole('button', { name: /home|back|dashboard|return/i });
    await userEvent.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('navigates to /super-admin when SUPER_ADMIN is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'SUPER_ADMIN' },
      isAuthenticated: true,
    });
    render(<NotFound />);

    const homeBtn = screen.getByRole('button', { name: /home|back|dashboard|return/i });
    await userEvent.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/super-admin', { replace: true });
  });
});
