import { useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/roleConfig';

/**
 * RBAC permissions map.
 * Each permission maps to the roles that have access.
 */
const PERMISSIONS = {
  // Staff management
  'staff:view': [ROLES.ADMIN],
  'staff:create': [ROLES.ADMIN],
  'staff:edit': [ROLES.ADMIN],
  'staff:delete': [ROLES.ADMIN],

  // Invoice management
  'invoice:view': [ROLES.ADMIN, ROLES.STAFF],
  'invoice:create': [ROLES.ADMIN, ROLES.STAFF],
  'invoice:edit': [ROLES.ADMIN, ROLES.STAFF],
  'invoice:delete': [ROLES.ADMIN],

  // Inventory management
  'inventory:view': [ROLES.ADMIN, ROLES.STAFF],
  'inventory:create': [ROLES.ADMIN, ROLES.STAFF],
  'inventory:edit': [ROLES.ADMIN, ROLES.STAFF],
  'inventory:delete': [ROLES.ADMIN],

  // Vehicle compliance
  'compliance:view': [ROLES.ADMIN, ROLES.STAFF],
  'compliance:create': [ROLES.ADMIN, ROLES.STAFF],
  'compliance:edit': [ROLES.ADMIN, ROLES.STAFF],

  // Buyer management
  'buyer:view': [ROLES.ADMIN, ROLES.STAFF],
  'buyer:create': [ROLES.ADMIN, ROLES.STAFF],
  'buyer:edit': [ROLES.ADMIN, ROLES.STAFF],
  'buyer:delete': [ROLES.ADMIN],

  // Sales invoice management
  'salesInvoice:view': [ROLES.ADMIN, ROLES.STAFF],
  'salesInvoice:create': [ROLES.ADMIN, ROLES.STAFF],
  'salesInvoice:edit': [ROLES.ADMIN, ROLES.STAFF],
  'salesInvoice:confirm': [ROLES.ADMIN],
  'salesInvoice:cancel': [ROLES.ADMIN],

  // Audit logs
  'auditLogs:view': [ROLES.ADMIN],
  'auditLogs:viewAll': [ROLES.SUPER_ADMIN],

  // Organization management (Super Admin)
  'organization:view': [ROLES.SUPER_ADMIN],
  'organization:create': [ROLES.SUPER_ADMIN],
  'organization:edit': [ROLES.SUPER_ADMIN],
  'organization:delete': [ROLES.SUPER_ADMIN],

  // Admin management (Super Admin)
  'admin:view': [ROLES.SUPER_ADMIN],
  'admin:create': [ROLES.SUPER_ADMIN],
  'admin:edit': [ROLES.SUPER_ADMIN],
  'admin:delete': [ROLES.SUPER_ADMIN],

  // Dashboard
  'dashboard:view': [ROLES.ADMIN, ROLES.STAFF],
};

/**
 * Hook that provides role-based access control utilities.
 * 
 * Usage:
 *   const { hasPermission, canPerform } = usePermissions();
 *   
 *   // Check a single permission
 *   if (hasPermission('invoice:delete')) { ... }
 *   
 *   // Guard a component
 *   {canPerform('staff:delete') && <DeleteButton />}
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  const hasPermission = useCallback(
    (permission) => {
      if (!userRole) return false;
      const allowedRoles = PERMISSIONS[permission];
      if (!allowedRoles) return false;
      return allowedRoles.includes(userRole);
    },
    [userRole]
  );

  const hasAnyPermission = useCallback(
    (...permissions) => permissions.some(hasPermission),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (...permissions) => permissions.every(hasPermission),
    [hasPermission]
  );

  // Alias for convenience in JSX
  const canPerform = hasPermission;

  const role = userRole;
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const isAdmin = userRole === ROLES.ADMIN;
  const isStaff = userRole === ROLES.STAFF;

  return useMemo(
    () => ({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canPerform,
      role,
      isSuperAdmin,
      isAdmin,
      isStaff,
    }),
    [hasPermission, hasAnyPermission, hasAllPermissions, canPerform, role, isSuperAdmin, isAdmin, isStaff]
  );
};

/**
 * Component that conditionally renders children based on permissions.
 * 
 * <PermissionGate permission="invoice:delete">
 *   <DeleteButton />
 * </PermissionGate>
 */
export const PermissionGate = ({ permission, permissions, requireAll = false, fallback = null, children }) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (permissions) {
    allowed = requireAll ? hasAllPermissions(...permissions) : hasAnyPermission(...permissions);
  }

  return allowed ? children : fallback;
};

export default usePermissions;
