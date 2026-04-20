// ⚠️  PRODUCTION: VITE_API_BASE_URL environment variable MUST be set.
//    The localhost fallback is only safe for local development.
//    Set it in Vercel → Settings → Environment Variables.
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003',
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    GET_ALL: '/users',
    CREATE: '/users/create',
    CREATE_STAFF: '/users/create-staff',
    DELETE: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    UPDATE_REFRESH_TOKEN: (id) => `/users/update-refresh-token/${id}`,
    GET_ALL_STAFF: (orgId) => `/users/find-all-staff-by-organization/${orgId}`,
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
    GET_ALL: '/organizations',
    CREATE: '/organizations',
    UPDATE: (id) => `/organizations/${id}`,
    DELETE: (id) => `/organizations/${id}`,
  },
  INVOICES: {
    BASE: '/invoice',
    GET_ALL: '/invoice',
    GET_BY_ID: (id) => `/invoice/${id}`,
    CREATE: '/invoice',
    UPDATE: (id) => `/invoice/${id}`,
    DELETE: (id) => `/invoice/${id}`,
    VEHICLE: {
      GET_ALL: '/invoice/vechile',
      CREATE: '/invoice/vechile',
      GET_BY_ID: '/invoice/vechile',
      UPDATE: (id) => `/invoice/vechile/${id}`,
      DELETE: (id) => `/invoice/vechile/${id}`,
    },
    DOCUMENTS: {
      UPLOAD: '/invoice/purchase-documents',
      GET: '/invoice/purchase-documents',
    },
  },
  LEADS: {
    BASE: '/leads',
    GET_ALL: '/leads',
    GET_BY_ID: (id) => `/leads/${id}`,
    CREATE: '/leads',
    UPDATE: (id) => `/leads/${id}`,
    DELETE: (id) => `/leads/${id}`,
    ASSIGN: (id) => `/leads/${id}/assign`,
    UPDATE_STATUS: (id) => `/leads/${id}/status`,
    UPLOAD_DOCUMENTS: (id) => `/leads/${id}/documents`,
    GET_DOCUMENTS: (id) => `/leads/${id}/documents`,
    LOOKUP: '/leads/lookup',
    LOOKUP_BY_ID: (id) => `/leads/lookup/${id}`,
  },
  INVENTORY: {
    BASE: '/inventory',
    GET_ALL: '/inventory',
    GET_BY_ID: (id) => `/inventory/${id}`,
    CREATE: '/inventory',
    UPDATE: (id) => `/inventory/${id}`,
    DELETE: (id) => `/inventory/${id}`,
  },
  AUDIT_LOGS: {
    GET_ALL: '/audit-logs',
    GET_STAFF: '/audit-logs/staff',
    GET_BY_ID: (id) => `/audit-logs/${id}`,
  },
  VEHICLE_COMPLIANCE: {
    COD: {
      CREATE: '/vehicle-compliance/vechile-cod',
      GET_ALL: '/vehicle-compliance/vechile-cod',
      GET_BY_VEHICLE: (vehicleId) => `/vehicle-compliance/vechile-cod/vehicle/${vehicleId}`,
      UPDATE_RTO: (id) => `/vehicle-compliance/vechile-cod/${id}/rto`,
    },
  },
  SALES_DISPATCH: {
    BUYERS: {
      BASE: '/sales-dispatch/buyers',
      GET_ALL: '/sales-dispatch/buyers',
      GET_BY_ID: (id) => `/sales-dispatch/buyers/${id}`,
      CREATE: '/sales-dispatch/buyers',
      UPDATE: (id) => `/sales-dispatch/buyers/${id}`,
      DELETE: (id) => `/sales-dispatch/buyers/${id}`,
    },
    INVOICES: {
      BASE: '/sales-dispatch/invoices',
      GET_ALL: '/sales-dispatch/invoices',
      GET_BY_ID: (id) => `/sales-dispatch/invoices/${id}`,
      CREATE: '/sales-dispatch/invoices',
      UPDATE: (id) => `/sales-dispatch/invoices/${id}`,
      CONFIRM: (id) => `/sales-dispatch/invoices/${id}/confirm`,
      CANCEL: (id) => `/sales-dispatch/invoices/${id}/cancel`,
    },
  },
  TAX_COMPLIANCE: {
    CONFIG: '/tax-compliance/config',
    EWAY_BILLS: '/tax-compliance/eway-bills',
    EWAY_BILL_BY_INVOICE: (salesInvoiceId) => `/tax-compliance/eway-bills/invoice/${salesInvoiceId}`,
    GST_AUDIT_LOG: '/tax-compliance/gst-audit-log',
    GST_SUMMARY: '/reports/gst-summary',
  },
  DAMAGE_ADJUSTMENTS: {
    BASE: '/damage-adjustments',
    GET_ALL: '/damage-adjustments',
    CREATE: '/damage-adjustments',
  },
  ACCOUNTING: {
    CHART_OF_ACCOUNTS: '/accounting/chart-of-accounts',
    LEDGER_ENTRIES: '/accounting/ledger-entries',
    PNL: '/accounting/pnl',
    INVOICE_PAYMENTS: '/accounting/invoice-payments',
  },
};

export default API_CONFIG;
