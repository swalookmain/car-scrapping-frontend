import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for inventory list
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const inventoryApi = {
  // ── Inventory CRUD ────────────────────────────────────────────
  getAll: async (filters = {}, { useCache = true } = {}) => {
    const key = JSON.stringify(filters);
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }

    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const params = {};
        if (filters.condition) params.condition = filters.condition;
        if (filters.status) params.status = filters.status;
        if (filters.vechileId) params.vechileId = filters.vechileId;
        if (filters.invoiceId) params.invoiceId = filters.invoiceId;
        // support pagination: page (1-based) and limit
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;

        const response = await axiosInstance.get(ENDPOINTS.INVENTORY.GET_ALL, { params });
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
    const response = await axiosInstance.get(ENDPOINTS.INVENTORY.GET_BY_ID(id));
    return response.data;
  },

  create: async (payload) => {
    // payload: { invoiceId, vechileId, parts: [...] }
    const response = await axiosInstance.post(ENDPOINTS.INVENTORY.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.INVENTORY.UPDATE(id), payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.INVENTORY.DELETE(id));
    return response.data;
  },

  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default inventoryApi;
