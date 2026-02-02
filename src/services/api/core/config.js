const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
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
};

export default API_CONFIG;
