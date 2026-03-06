/**
 * Tests for AuthContext (AuthProvider, useAuth).
 * authApi and refreshService are mocked via MSW/vi.mock so no real network calls happen.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// ── Mock the API layer ─────────────────────────────────────────
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../services/api/core/refreshService', () => ({
  default: vi.fn(),
}));

// ── Mock roleConfig ─────────────────────────────────────────────
vi.mock('../config/roleConfig', () => ({
  getDefaultRoute: (role) => (role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'),
  isRouteAllowed: vi.fn().mockReturnValue(true),
  ROLES: { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', STAFF: 'STAFF' },
  ROUTE_CONFIG: [],
  SIDEBAR_CONFIG: [],
  getFilteredSidebarConfig: vi.fn().mockReturnValue([]),
}));

const { authApi } = await import('../services/api');
const { AuthProvider, useAuth } = await import('../context/AuthContext');

// Helper: a simple consumer component
const AuthConsumer = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user-role">{user?.role ?? 'none'}</div>
    </div>
  );
};

const renderWithAuth = (ui = <AuthConsumer />) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('AuthContext — initial state', () => {
  beforeEach(() => sessionStorage.clear());

  it('renders unauthenticated state when no token stored', async () => {
    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('no'));
  });

  it('restores session from sessionStorage when token + user present', async () => {
    sessionStorage.setItem('accessToken', 'some-token');
    sessionStorage.setItem('user', JSON.stringify({ role: 'ADMIN', name: 'Alice' }));
    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('user-role').textContent).toBe('ADMIN'));
    expect(screen.getByTestId('authenticated').textContent).toBe('yes');
  });
});

describe('AuthContext — login', () => {
  beforeEach(() => {
    sessionStorage.clear();
    authApi.login.mockReset();
  });

  it('sets user and isAuthenticated after successful login', async () => {
    authApi.login.mockResolvedValue({
      accessToken: 'access-abc',
      user: { role: 'ADMIN', name: 'Test Admin' },
    });

    const LoginButton = () => {
      const { login, isAuthenticated, user } = useAuth();
      return (
        <>
          <button onClick={() => login('admin@test.com', 'pass123')}>Login</button>
          <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
          <span data-testid="role">{user?.role ?? 'none'}</span>
        </>
      );
    };

    render(<AuthProvider><LoginButton /></AuthProvider>);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('yes');
      expect(screen.getByTestId('role').textContent).toBe('ADMIN');
    });
  });

  it('returns redirectPath from getDefaultRoute', async () => {
    authApi.login.mockResolvedValue({
      accessToken: 'tok',
      user: { role: 'ADMIN' },
    });
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let redirectPath;

    const CaptureLogin = () => {
      const { login } = useAuth();
      return (
        <button onClick={async () => {
          const result = await login('a@a.com', 'pw');
          redirectPath = result.redirectPath;
        }}>
          Login
        </button>
      );
    };

    render(<AuthProvider><CaptureLogin /></AuthProvider>);
    await act(async () => {
      await userEvent.click(screen.getByRole('button'));
    });
    expect(redirectPath).toBe('/dashboard');
  });
});

describe('AuthContext — logout', () => {
  it('clears user and isAuthenticated after logout', async () => {
    sessionStorage.setItem('accessToken', 'tok');
    sessionStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

    const LogoutButton = () => {
      const { logout, isAuthenticated } = useAuth();
      return (
        <>
          <button onClick={logout}>Logout</button>
          <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
        </>
      );
    };

    render(<AuthProvider><LogoutButton /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('yes'));

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    });

    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('no'));
  });
});

describe('useAuth outside provider', () => {
  it('throws an error when used outside AuthProvider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Bad = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Bad />)).toThrow('useAuth must be used within AuthProvider');
    errorSpy.mockRestore();
  });
});
