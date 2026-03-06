/**
 * Tests for ProtectedRoute component:
 *  - Redirects unauthenticated users to /
 *  - Shows loading spinner while auth is being resolved
 *  - Renders 404 when role doesn't have access to a route
 *  - Renders children when user is authenticated and authorised
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

// ── Mock AuthContext ───────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Mock roleConfig ────────────────────────────────────────────
const mockIsRouteAllowed = vi.fn();
vi.mock('../config/roleConfig', () => ({
  isRouteAllowed: (...args) => mockIsRouteAllowed(...args),
  ROLES: { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', STAFF: 'STAFF' },
  ROUTE_CONFIG: [],
  SIDEBAR_CONFIG: [],
  getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
  getFilteredSidebarConfig: vi.fn().mockReturnValue([]),
}));

// ── Mock NotFound ──────────────────────────────────────────────
vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found">404 Not Found</div>,
}));

const { default: ProtectedRoute } = await import('../components/auth/ProtectedRoute');

const renderProtectedRoute = ({ user = null, loading = false, path = '/dashboard' } = {}) => {
  const isAuthenticated = !!user;
  mockUseAuth.mockReturnValue({ user, loading, isAuthenticated });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div data-testid="login-page">Login</div>} />
        <Route
          path={path}
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div data-testid="catch-all">*</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute — loading state', () => {
  it('shows a loading spinner while auth is resolving', () => {
    renderProtectedRoute({ loading: true });
    // CircularProgress is rendered (no protected content or redirect)
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.queryByTestId('login-page')).toBeNull();
  });
});

describe('ProtectedRoute — unauthenticated', () => {
  it('redirects to / when user is null', async () => {
    renderProtectedRoute({ user: null, loading: false });
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeDefined();
    });
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});

describe('ProtectedRoute — authenticated + authorised', () => {
  it('renders children when user has access', async () => {
    mockIsRouteAllowed.mockReturnValue(true);
    renderProtectedRoute({
      user: { role: 'ADMIN' },
      loading: false,
      path: '/dashboard',
    });
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeDefined();
    });
  });
});

describe('ProtectedRoute — authenticated but unauthorised', () => {
  it('renders NotFound when role cannot access route', async () => {
    mockIsRouteAllowed.mockReturnValue(false);
    renderProtectedRoute({
      user: { role: 'STAFF' },
      loading: false,
      path: '/dashboard',
    });
    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeDefined();
    });
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});
