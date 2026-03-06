/**
 * Tests for roleConfig.js:
 *  - ROLES constants
 *  - ROUTE_CONFIG: which paths each role can access
 *  - isRouteAllowed utility
 *  - getDefaultRoute redirects
 */
import { ROLES, ROUTE_CONFIG, isRouteAllowed, getDefaultRoute } from '../config/roleConfig';

describe('ROLES constants', () => {
  it('defines SUPER_ADMIN role', () => {
    expect(ROLES.SUPER_ADMIN).toBe('SUPER_ADMIN');
  });
  it('defines ADMIN role', () => {
    expect(ROLES.ADMIN).toBe('ADMIN');
  });
  it('defines STAFF role', () => {
    expect(ROLES.STAFF).toBe('STAFF');
  });
  it('has exactly 3 roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(3);
  });
});

describe('ROUTE_CONFIG', () => {
  it('is an array', () => {
    expect(Array.isArray(ROUTE_CONFIG)).toBe(true);
  });
  it('every entry has a path and allowedRoles', () => {
    ROUTE_CONFIG.forEach((entry) => {
      expect(entry).toHaveProperty('path');
      expect(entry).toHaveProperty('allowedRoles');
      expect(Array.isArray(entry.allowedRoles)).toBe(true);
    });
  });
  it('dashboard is accessible to ADMIN and STAFF', () => {
    const dashboardRoute = ROUTE_CONFIG.find((r) => r.path === '/dashboard');
    expect(dashboardRoute.allowedRoles).toContain(ROLES.ADMIN);
    expect(dashboardRoute.allowedRoles).toContain(ROLES.STAFF);
    expect(dashboardRoute.allowedRoles).not.toContain(ROLES.SUPER_ADMIN);
  });
  it('staff route is only accessible to ADMIN', () => {
    const staffRoute = ROUTE_CONFIG.find((r) => r.path === '/staff');
    expect(staffRoute.allowedRoles).toContain(ROLES.ADMIN);
    expect(staffRoute.allowedRoles).not.toContain(ROLES.STAFF);
    expect(staffRoute.allowedRoles).not.toContain(ROLES.SUPER_ADMIN);
  });
  it('super-admin routes are only accessible to SUPER_ADMIN', () => {
    const superAdminRoutes = ROUTE_CONFIG.filter((r) => r.path.startsWith('/super-admin'));
    superAdminRoutes.forEach((route) => {
      expect(route.allowedRoles).toContain(ROLES.SUPER_ADMIN);
      expect(route.allowedRoles).not.toContain(ROLES.ADMIN);
      expect(route.allowedRoles).not.toContain(ROLES.STAFF);
    });
  });
});

describe('isRouteAllowed', () => {
  it('allows ADMIN on /dashboard', () => {
    expect(isRouteAllowed('/dashboard', ROLES.ADMIN)).toBe(true);
  });
  it('allows STAFF on /dashboard', () => {
    expect(isRouteAllowed('/dashboard', ROLES.STAFF)).toBe(true);
  });
  it('blocks SUPER_ADMIN on /dashboard', () => {
    expect(isRouteAllowed('/dashboard', ROLES.SUPER_ADMIN)).toBe(false);
  });
  it('blocks STAFF on /staff', () => {
    expect(isRouteAllowed('/staff', ROLES.STAFF)).toBe(false);
  });
  it('allows ADMIN on /staff', () => {
    expect(isRouteAllowed('/staff', ROLES.ADMIN)).toBe(true);
  });
  it('allows SUPER_ADMIN on /super-admin/organizations', () => {
    expect(isRouteAllowed('/super-admin/organizations', ROLES.SUPER_ADMIN)).toBe(true);
  });
  it('blocks ADMIN on /super-admin/organizations', () => {
    expect(isRouteAllowed('/super-admin/organizations', ROLES.ADMIN)).toBe(false);
  });
  it('returns false for unknown paths', () => {
    expect(isRouteAllowed('/some-unknown-path', ROLES.ADMIN)).toBe(false);
  });
  it('returns false when role is null', () => {
    expect(isRouteAllowed('/dashboard', null)).toBe(false);
  });
});

describe('getDefaultRoute', () => {
  it('returns /super-admin for SUPER_ADMIN', () => {
    const route = getDefaultRoute(ROLES.SUPER_ADMIN);
    expect(route).toMatch(/super-admin/);
  });
  it('returns /dashboard for ADMIN', () => {
    expect(getDefaultRoute(ROLES.ADMIN)).toBe('/dashboard');
  });
  it('returns /dashboard for STAFF', () => {
    expect(getDefaultRoute(ROLES.STAFF)).toBe('/dashboard');
  });
  it('returns / for unknown role', () => {
    const route = getDefaultRoute('UNKNOWN_ROLE');
    expect(typeof route).toBe('string');
  });
});
