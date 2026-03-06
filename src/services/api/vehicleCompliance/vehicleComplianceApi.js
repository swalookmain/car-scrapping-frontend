import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const vehicleComplianceApi = {
  // ── COD Compliance CRUD ───────────────────────────────────────

  /**
   * Get all COD compliance records with filters
   * @param {number} page
   * @param {number} limit
   * @param {object} filters - { invoiceId, vehicleId, codGenerated, cvsGenerated, rtoStatus }
   */
  getAll: async (page = 1, limit = 10, filters = {}, { useCache = true } = {}) => {
    const params = { page, limit };
    if (filters.invoiceId) params.invoiceId = filters.invoiceId;
    if (filters.vehicleId) params.vehicleId = filters.vehicleId;
    if (filters.codGenerated !== undefined && filters.codGenerated !== '') params.codGenerated = filters.codGenerated;
    if (filters.cvsGenerated !== undefined && filters.cvsGenerated !== '') params.cvsGenerated = filters.cvsGenerated;
    if (filters.rtoStatus && filters.rtoStatus !== '') params.rtoStatus = filters.rtoStatus;

    const key = JSON.stringify(params);
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }
    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.VEHICLE_COMPLIANCE.COD.GET_ALL, { params });
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

  /**
   * Create a new COD compliance record
   */
  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.VEHICLE_COMPLIANCE.COD.CREATE, payload);
    return response.data;
  },

  /**
   * Get COD compliance record by vehicle ID
   */
  getByVehicleId: async (vehicleId) => {
    const response = await axiosInstance.get(ENDPOINTS.VEHICLE_COMPLIANCE.COD.GET_BY_VEHICLE(vehicleId));
    return response.data;
  },

  /**
   * Update RTO tracking & document details for a COD record
   */
  updateRto: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.VEHICLE_COMPLIANCE.COD.UPDATE_RTO(id), payload);
    return response.data;
  },

  /**
   * Invalidate the cache (call after mutations)
   */
  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default vehicleComplianceApi;
