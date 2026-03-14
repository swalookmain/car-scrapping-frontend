import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const damageAdjustmentsApi = {
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
        if (filters.partId) params.partId = filters.partId;
        const response = await axiosInstance.get(ENDPOINTS.DAMAGE_ADJUSTMENTS.GET_ALL, { params });
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

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.DAMAGE_ADJUSTMENTS.CREATE, payload);
    return response.data;
  },

  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default damageAdjustmentsApi;
