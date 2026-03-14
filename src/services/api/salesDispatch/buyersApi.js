import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for buyers list
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const buyersApi = {
  // ── Buyers CRUD ───────────────────────────────────────────────
  getAll: async (page = 1, limit = 10, filters = {}, { useCache = true } = {}) => {
    const key = JSON.stringify({ page, limit, ...filters });
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }

    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const params = { page, limit };
        if (filters.buyerType) params.buyerType = filters.buyerType;
        if (filters.buyerName) params.buyerName = filters.buyerName;

        const response = await axiosInstance.get(ENDPOINTS.SALES_DISPATCH.BUYERS.GET_ALL, { params });
        _cache.ts = Date.now();
        _cache.key = key;
        _cache.data = response.data;
        return response.data;
      } finally {
        _inflight.delete(key);
      }
    })();

    _inflight.set(key, promise);
    return promise;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.SALES_DISPATCH.BUYERS.GET_BY_ID(id));
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.SALES_DISPATCH.BUYERS.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.SALES_DISPATCH.BUYERS.UPDATE(id), payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.SALES_DISPATCH.BUYERS.DELETE(id));
    return response.data;
  },

  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default buyersApi;
