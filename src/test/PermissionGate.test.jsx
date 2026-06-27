/**
 * Tests for PermissionGate component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ROLES } from '../config/roleConfig';

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const { PermissionGate } = await import('../hooks/usePermissions');

const renderGate = (role, props, children = 'Secret Content') => {
  mockUseAuth.mockReturnValue({ user: role ? { role } : null });
  return render(
    <PermissionGate {...props} fallback={<span>Access Denied</span>}>
      {children}
    </PermissionGate>,
  );
};

describe('PermissionGate', () => {
  it('renders children when ADMIN has permission', () => {
    renderGate(ROLES.ADMIN, { permission: 'staff:view' });
    expect(screen.getByText('Secret Content')).toBeDefined();
  });

  it('renders fallback when STAFF lacks permission', () => {
    renderGate(ROLES.STAFF, { permission: 'staff:view' });
    expect(screen.getByText('Access Denied')).toBeDefined();
  });

  it('renders fallback when unauthenticated', () => {
    renderGate(null, { permission: 'invoice:view' });
    expect(screen.getByText('Access Denied')).toBeDefined();
  });

  it('supports hasAnyPermission via permissions prop', () => {
    renderGate(ROLES.ADMIN, {
      permissions: ['organization:view', 'staff:view'],
    });
    expect(screen.getByText('Secret Content')).toBeDefined();
  });

  it('requireAll blocks when not all permissions match', () => {
    renderGate(ROLES.ADMIN, {
      permissions: ['staff:view', 'organization:view'],
      requireAll: true,
    });
    expect(screen.getByText('Access Denied')).toBeDefined();
  });

  it('SUPER_ADMIN sees organization:view content', () => {
    renderGate(ROLES.SUPER_ADMIN, { permission: 'organization:view' });
    expect(screen.getByText('Secret Content')).toBeDefined();
  });
});
