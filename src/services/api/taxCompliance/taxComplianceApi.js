import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for tax config
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const taxComplianceApi = {
  // ── Tax Config ────────────────────────────────────────────────
  getConfig: async ({ useCache = true } = {}) => {
    const key = 'tax-config';
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }

    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.TAX_COMPLIANCE.CONFIG);
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

  upsertConfig: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.TAX_COMPLIANCE.CONFIG, payload);
    // Invalidate config cache on update
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
    return response.data;
  },

  // ── E-Way Bills ───────────────────────────────────────────────
  createEwayBill: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.TAX_COMPLIANCE.EWAY_BILLS, payload);
    return response.data;
  },

  getEwayBills: async (page = 1, limit = 10, filters = {}, { useCache = false } = {}) => {
    const params = { page, limit, ...filters };
    const response = await axiosInstance.get(ENDPOINTS.TAX_COMPLIANCE.EWAY_BILLS, { params });
    return response.data;
  },

  getEwayBillByInvoice: async (salesInvoiceId) => {
    const response = await axiosInstance.get(ENDPOINTS.TAX_COMPLIANCE.EWAY_BILL_BY_INVOICE(salesInvoiceId));
    return response.data;
  },

  // ── GST Audit Log ─────────────────────────────────────────────
  getGstAuditLogs: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await axiosInstance.get(ENDPOINTS.TAX_COMPLIANCE.GST_AUDIT_LOG, { params });
    return response.data;
  },

  // ── GST Summary Report ────────────────────────────────────────
  getGstSummary: async (filters = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.TAX_COMPLIANCE.GST_SUMMARY, { params: filters });
    return response.data;
  },

  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default taxComplianceApi;
