import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for organizations list
const _orgCache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;

// In-flight dedupe for organizations list
const _inflightOrgs = new Map();

export const organizationsApi = {
  getAll: async (page = 1, limit = 10, { useCache = true } = {}) => {
    const key = JSON.stringify({ page, limit });
    const now = Date.now();
    if (useCache && _orgCache.data && _orgCache.key === key && now - _orgCache.ts < CACHE_TTL) {
      return _orgCache.data;
    }

    if (_inflightOrgs.has(key)) return _inflightOrgs.get(key);

    const promise = (async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.ORGANIZATIONS.GET_ALL, { params: { page, limit } });
        _orgCache.ts = Date.now();
        _orgCache.key = key;
        _orgCache.data = response.data;
        return response.data;
      } finally {
        _inflightOrgs.delete(key);
      }
    })();

    _inflightOrgs.set(key, promise);
    return promise;
  },

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.ORGANIZATIONS.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.ORGANIZATIONS.UPDATE(id), payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.ORGANIZATIONS.DELETE(id));
    return response.data;
  },
};

export default organizationsApi;
