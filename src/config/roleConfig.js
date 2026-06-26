import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PolicyIcon from '@mui/icons-material/Policy';
import StoreIcon from '@mui/icons-material/Store';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PercentIcon from '@mui/icons-material/Percent';
import RouteIcon from '@mui/icons-material/Route';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ArticleIcon from '@mui/icons-material/Article';
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';


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
    path: '/leads',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/auctions',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/authorization-letters',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/settings/letter',
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/invoices',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    path: '/yard',
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
        icon: HistoryIcon,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
      {
        path: '/super-admin/organizations',
        label: 'Organizations',
        icon: CorporateFareIcon,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
      {
        path: '/super-admin/admins',
        label: 'Admin Users',
        icon: ManageAccountsIcon,
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
        icon: SpaceDashboardIcon,
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
        icon: HistoryIcon,
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
        icon: ManageAccountsIcon,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
  {
    section: 'Lead Management',
    items: [
      {
        path: '/leads',
        label: 'Leads',
        icon: PersonSearchIcon,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
  {
    section: 'Auction Management',
    items: [
      {
        path: '/auctions',
        label: 'Auctions',
        icon: GavelIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/authorization-letters',
        label: 'Authorization Letters',
        icon: ArticleIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Settings',
    items: [
      {
        path: '/settings/letter',
        label: 'Letter Settings',
        icon: DrawIcon,
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
        icon: ReceiptLongIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    section: 'Yard Operations',
    items: [
      {
        path: '/yard',
        label: 'Yard Management',
        icon: WarehouseIcon,
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
        icon: CategoryIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/inventory/damage-adjustments',
        label: 'Damage Adjustments',
        icon: BuildCircleIcon,
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
        icon: PolicyIcon,
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
        icon: StoreIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/sales/invoices',
        label: 'Sales Invoices',
        icon: PointOfSaleIcon,
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
        icon: PercentIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/tax/eway-bills',
        label: 'E-Way Bills',
        icon: RouteIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        path: '/tax/summary',
        label: 'GST Summary',
        icon: SummarizeIcon,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        path: '/tax/audit',
        label: 'GST Audit Trail',
        icon: FindInPageIcon,
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
        icon: AccountBalanceWalletIcon,
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
        icon: AnalyticsIcon,
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

/** Resolve current page label for header / breadcrumbs */
export const getPageLabel = (pathname) => {
  for (const section of SIDEBAR_CONFIG) {
    for (const item of section.items) {
      if (item.path === pathname) return item.label;
    }
  }
  const sorted = SIDEBAR_CONFIG.flatMap((s) => s.items).sort(
    (a, b) => b.path.length - a.path.length,
  );
  const partial = sorted.find(
    (item) => pathname.startsWith(item.path) && item.path !== '/',
  );
  if (partial) return partial.label;
  return 'Workspace';
};
