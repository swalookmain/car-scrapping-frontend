/**
 * Tests for usePermissions hook.
 * AuthContext is mocked so we can inject any role.
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// ── Mock AuthContext ───────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Import AFTER mock is set up ────────────────────────────────
const { usePermissions } = await import('../hooks/usePermissions');

const renderWithRole = (role) => {
  mockUseAuth.mockReturnValue({ user: role ? { role } : null });
  return renderHook(() => usePermissions());
};

describe('usePermissions — ADMIN role', () => {
  it('can view staff', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.hasPermission('staff:view')).toBe(true);
  });
  it('can create staff', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.hasPermission('staff:create')).toBe(true);
  });
  it('can delete invoice', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.hasPermission('invoice:delete')).toBe(true);
  });
  it('can view dashboard', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.hasPermission('dashboard:view')).toBe(true);
  });
  it('cannot view organizations (super-admin only)', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.hasPermission('organization:view')).toBe(false);
  });
  it('isAdmin is true', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.isAdmin).toBe(true);
  });
  it('isSuperAdmin is false', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.isSuperAdmin).toBe(false);
  });
  it('isStaff is false', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.isStaff).toBe(false);
  });
});

describe('usePermissions — STAFF role', () => {
  it('can view invoices', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasPermission('invoice:view')).toBe(true);
  });
  it('cannot delete invoices', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasPermission('invoice:delete')).toBe(false);
  });
  it('cannot view staff', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasPermission('staff:view')).toBe(false);
  });
  it('cannot view audit logs', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasPermission('auditLogs:view')).toBe(false);
  });
  it('can view inventory', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasPermission('inventory:view')).toBe(true);
  });
  it('isStaff is true', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.isStaff).toBe(true);
  });
});

describe('usePermissions — SUPER_ADMIN role', () => {
  it('can view organizations', () => {
    const { result } = renderWithRole('SUPER_ADMIN');
    expect(result.current.hasPermission('organization:view')).toBe(true);
  });
  it('can manage admins', () => {
    const { result } = renderWithRole('SUPER_ADMIN');
    expect(result.current.hasPermission('admin:create')).toBe(true);
  });
  it('cannot view dashboard (admin/staff only)', () => {
    const { result } = renderWithRole('SUPER_ADMIN');
    expect(result.current.hasPermission('dashboard:view')).toBe(false);
  });
  it('can view all audit logs', () => {
    const { result } = renderWithRole('SUPER_ADMIN');
    expect(result.current.hasPermission('auditLogs:viewAll')).toBe(true);
  });
  it('isSuperAdmin is true', () => {
    const { result } = renderWithRole('SUPER_ADMIN');
    expect(result.current.isSuperAdmin).toBe(true);
  });
});

describe('usePermissions — unauthenticated (no user)', () => {
  it('hasPermission returns false for every permission', () => {
    const { result } = renderWithRole(null);
    expect(result.current.hasPermission('invoice:view')).toBe(false);
    expect(result.current.hasPermission('staff:view')).toBe(false);
    expect(result.current.hasPermission('organization:view')).toBe(false);
  });
  it('role is undefined', () => {
    const { result } = renderWithRole(null);
    expect(result.current.role).toBeUndefined();
  });
});

describe('usePermissions — hasAnyPermission', () => {
  it('returns true when ADMIN has at least one permission', () => {
    const { result } = renderWithRole('ADMIN');
    // ADMIN has staff:view but not organization:view
    expect(result.current.hasAnyPermission('staff:view', 'organization:view')).toBe(true);
  });
  it('returns false when no permission matches', () => {
    const { result } = renderWithRole('STAFF');
    expect(result.current.hasAnyPermission('staff:view', 'organization:view')).toBe(false);
  });
});

describe('usePermissions — canPerform alias', () => {
  it('canPerform is an alias for hasPermission', () => {
    const { result } = renderWithRole('ADMIN');
    expect(result.current.canPerform('staff:delete')).toBe(true);
    expect(result.current.canPerform('organization:view')).toBe(false);
  });
});
