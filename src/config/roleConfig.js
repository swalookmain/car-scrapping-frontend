import DashboardIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/Groups';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory2';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';


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
  {
    path: '/inventory',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/inventory/damage-adjustments',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/audit-logs',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/vehicle-compliance',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/sales/buyers',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/sales/invoices',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/tax/config',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/tax/eway-bills',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/tax/summary',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/tax/audit',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/accounting',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/accounting/ledger',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/accounting/pnl',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/super-admin/audit-logs',
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: '/super-admin',
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
];


export const SIDEBAR_CONFIG = [
  {
    section: 'Super Admin',
    items: [
      {
        path: '/super-admin/audit-logs',
        label: 'Audit Logs',
        icon: AssignmentIcon,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
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
    section: 'Audit Logs',
    items: [
      {
        path: '/audit-logs',
        label: 'Audit Logs',
        icon: AssignmentIcon,
        allowedRoles: [ROLES.ADMIN],
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
  {
    section: 'Inventory Management',
    items: [
      {
        path: '/inventory',
        label: 'Parts Inventory',
        icon: InventoryIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/inventory/damage-adjustments',
        label: 'Damage Adjustments',
        icon: ReportProblemIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Vehicle Compliance',
    items: [
      {
        path: '/vehicle-compliance',
        label: 'COD Tracking',
        icon: VerifiedUserIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Sales & Dispatch',
    items: [
      {
        path: '/sales/buyers',
        label: 'Buyers',
        icon: StorefrontIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/sales/invoices',
        label: 'Sales Invoices',
        icon: LocalShippingIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Tax Compliance',
    items: [
      {
        path: '/tax/config',
        label: 'Tax Configuration',
        icon: AccountBalanceIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/tax/eway-bills',
        label: 'E-Way Bills',
        icon: LocalShippingIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/tax/summary',
        label: 'GST Summary',
        icon: ReceiptIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/tax/audit',
        label: 'GST Audit Trail',
        icon: AssignmentIcon,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
  {
    section: 'Accounting',
    items: [
      {
        path: '/accounting',
        label: 'Overview',
        icon: AccountBalanceIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/accounting/ledger',
        label: 'General Ledger',
        icon: MenuBookIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/accounting/pnl',
        label: 'Profit & Loss',
        icon: AssignmentIcon,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
];


export const getDefaultRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/super-admin/audit-logs';
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
