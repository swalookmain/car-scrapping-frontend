/**
 * Full RBAC matrix: every route × every role (SUPER_ADMIN, ADMIN, STAFF).
 */
import { ROLES, ROUTE_CONFIG, isRouteAllowed } from '../config/roleConfig';

const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF];

describe('Full route RBAC matrix', () => {
  ROUTE_CONFIG.forEach(({ path, allowedRoles, moduleId }) => {
    describe(path, () => {
      ALL_ROLES.forEach((role) => {
        const allowed = allowedRoles.includes(role);
        it(`${role} → ${allowed ? 'allowed' : 'denied'}`, () => {
          const modules = role === ROLES.STAFF && allowed ? [moduleId].filter(Boolean) : [];
          expect(isRouteAllowed(path, role, modules)).toBe(allowed);
        });
      });

      it('denies unauthenticated access', () => {
        expect(isRouteAllowed(path, null)).toBe(false);
      });
    });
  });
});

describe('Role isolation rules', () => {
  it('SUPER_ADMIN cannot access operational dashboard', () => {
    expect(isRouteAllowed('/dashboard', ROLES.SUPER_ADMIN)).toBe(false);
  });

  it('STAFF cannot access super-admin routes', () => {
    const superRoutes = ROUTE_CONFIG.filter((r) => r.path.startsWith('/super-admin'));
    superRoutes.forEach((route) => {
      expect(isRouteAllowed(route.path, ROLES.STAFF)).toBe(false);
    });
  });

  it('ADMIN cannot access super-admin routes', () => {
    const superRoutes = ROUTE_CONFIG.filter((r) => r.path.startsWith('/super-admin'));
    superRoutes.forEach((route) => {
      expect(isRouteAllowed(route.path, ROLES.ADMIN)).toBe(false);
    });
  });

  it('STAFF cannot access admin-only staff management', () => {
    expect(isRouteAllowed('/staff', ROLES.STAFF, ['staff'])).toBe(false);
    expect(isRouteAllowed('/audit-logs', ROLES.STAFF, ['audit-logs'])).toBe(false);
    expect(isRouteAllowed('/tax/config', ROLES.STAFF, ['tax'])).toBe(false);
    expect(isRouteAllowed('/accounting', ROLES.STAFF, ['accounting'])).toBe(false);
  });

  it('STAFF with only yard cannot open inventory or lifting', () => {
    expect(isRouteAllowed('/yard', ROLES.STAFF, ['yard'])).toBe(true);
    expect(isRouteAllowed('/inventory', ROLES.STAFF, ['yard'])).toBe(false);
    expect(isRouteAllowed('/lifting', ROLES.STAFF, ['yard'])).toBe(false);
    expect(isRouteAllowed('/lifting', ROLES.STAFF, ['lifting'])).toBe(true);
  });
});
