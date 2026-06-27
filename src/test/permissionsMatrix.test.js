/**
 * Full permissions matrix: every permission × every role.
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { ROLES } from '../config/roleConfig';
import { PERMISSIONS } from '../hooks/usePermissions';

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const { usePermissions } = await import('../hooks/usePermissions');

const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, null];
const PERMISSION_KEYS = Object.keys(PERMISSIONS);

function renderWithRole(role) {
  mockUseAuth.mockReturnValue({ user: role ? { role } : null });
  return renderHook(() => usePermissions());
}

describe('Full permissions matrix', () => {
  PERMISSION_KEYS.forEach((permission) => {
    describe(permission, () => {
      ALL_ROLES.forEach((role) => {
        const expected = role
          ? PERMISSIONS[permission].includes(role)
          : false;

        it(`${role ?? 'unauthenticated'} → ${expected ? 'granted' : 'denied'}`, () => {
          const { result } = renderWithRole(role);
          expect(result.current.hasPermission(permission)).toBe(expected);
        });
      });
    });
  });
});

describe('Admin-only destructive actions', () => {
  const adminOnlyDestructive = [
    'invoice:delete',
    'inventory:delete',
    'buyer:delete',
    'staff:delete',
    'salesInvoice:confirm',
    'salesInvoice:cancel',
    'damage:reclassify',
  ];

  adminOnlyDestructive.forEach((perm) => {
    it(`STAFF cannot ${perm}`, () => {
      const { result } = renderWithRole(ROLES.STAFF);
      expect(result.current.hasPermission(perm)).toBe(false);
    });

    it(`ADMIN can ${perm}`, () => {
      const { result } = renderWithRole(ROLES.ADMIN);
      expect(result.current.hasPermission(perm)).toBe(true);
    });
  });
});

describe('Super admin exclusive permissions', () => {
  const superOnly = PERMISSION_KEYS.filter((key) =>
    PERMISSIONS[key].length === 1 && PERMISSIONS[key][0] === ROLES.SUPER_ADMIN,
  );

  superOnly.forEach((perm) => {
    it(`${perm} is SUPER_ADMIN only`, () => {
      expect(renderWithRole(ROLES.SUPER_ADMIN).result.current.hasPermission(perm)).toBe(true);
      expect(renderWithRole(ROLES.ADMIN).result.current.hasPermission(perm)).toBe(false);
      expect(renderWithRole(ROLES.STAFF).result.current.hasPermission(perm)).toBe(false);
    });
  });
});
