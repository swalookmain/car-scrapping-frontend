import DashboardIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/Groups';
import ReceiptIcon from '@mui/icons-material/Receipt';


export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
};


export const ROUTE_CONFIG = [
  {
    path: '/super-admin/organizations',
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: '/super-admin/admins',
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: '/dashboard',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/staff',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/invoices',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
];


export const SIDEBAR_CONFIG = [
  {
    section: 'Super Admin',
    items: [
      {
        path: '/super-admin/organizations',
        label: 'Organizations',
        icon: DashboardIcon,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
      {
        path: '/super-admin/admins',
        label: 'Admin Users',
        icon: PeopleIcon,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    section: 'Dashboard',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Staff Management',
    items: [
      {
        path: '/staff',
        label: 'Staff',
        icon: PeopleIcon,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
  {
    section: 'Invoice Management',
    items: [
      {
        path: '/invoices',
        label: 'Purchase Invoices',
        icon: ReceiptIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
];


export const getDefaultRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/super-admin/organizations';
    case ROLES.ADMIN:
      return '/dashboard';
    case ROLES.STAFF:
      return '/dashboard';
    default:
      return '/';
  }
};

export const isRouteAllowed = (path, role) => {
  const route = ROUTE_CONFIG.find((r) => r.path === path);
  if (!route) return false;
  return route.allowedRoles.includes(role);
};

export const getFilteredSidebarConfig = (role) => {
  return SIDEBAR_CONFIG.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.allowedRoles.includes(role)),
  })).filter((section) => section.items.length > 0);
};
