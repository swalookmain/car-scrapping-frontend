import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache to avoid unnecessary repeated API calls
const _cache = {
  users: { ts: 0, key: null, data: null },
};

// Track in-flight requests to deduplicate concurrent identical calls
const _inflight = {
  users: new Map(),
};

const CACHE_TTL = 60 * 1000; // 60 seconds

export const usersApi = {
  getUsers: async (page = 1, limit = 10, { useCache = true } = {}) => {
    const key = JSON.stringify({ page, limit });
    const now = Date.now();
    if (useCache && _cache.users.data && _cache.users.key === key && now - _cache.users.ts < CACHE_TTL) {
      return _cache.users.data;
    }

    // If an identical request is already in progress, return its promise
    if (_inflight.users.has(key)) {
      return _inflight.users.get(key);
    }

    const promise = (async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.USERS.GET_ALL, { params: { page, limit } });
        _cache.users = { ts: Date.now(), key, data: response.data };
        return response.data;
      } finally {
        _inflight.users.delete(key);
      }
    })();

    _inflight.users.set(key, promise);
    return promise;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post(ENDPOINTS.USERS.CREATE, userData);
    return response.data;
  },

  updateUser: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.USERS.UPDATE(id), payload);
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await axiosInstance.post(ENDPOINTS.USERS.CREATE_STAFF, staffData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.USERS.DELETE(id));
    return response.data;
  },

  updateRefreshToken: async (id) => {
    const response = await axiosInstance.patch(ENDPOINTS.USERS.UPDATE_REFRESH_TOKEN(id));
    return response.data;
  },

  getAllStaffByOrganization: async (organizationId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(ENDPOINTS.USERS.GET_ALL_STAFF(organizationId), {
      params: { page, limit },
    });
    return response.data;
  },
};

export default usersApi;
