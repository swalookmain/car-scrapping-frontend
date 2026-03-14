import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const accountingApi = {
  // ── Chart of Accounts ─────────────────────────────────────────
  getChartOfAccounts: async () => {
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS);
    return response.data;
  },

  // ── Ledger Entries ────────────────────────────────────────────
  getLedgerEntries: async (params = {}) => {
    const query = {};
    if (params.fromDate) query.fromDate = params.fromDate;
    if (params.toDate) query.toDate = params.toDate;
    if (params.referenceType) query.referenceType = params.referenceType;
    if (params.accountId) query.accountId = params.accountId;
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTING.LEDGER_ENTRIES, { params: query });
    return response.data;
  },

  // ── P&L Summary ──────────────────────────────────────────────
  getPnl: async (params = {}) => {
    const query = {};
    if (params.fromDate) query.fromDate = params.fromDate;
    if (params.toDate) query.toDate = params.toDate;
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTING.PNL, { params: query });
    return response.data;
  },

  // ── Invoice Payments ─────────────────────────────────────────
  recordPayment: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.ACCOUNTING.INVOICE_PAYMENTS, payload);
    return response.data;
  },

  getPayments: async (invoiceType, invoiceId) => {
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTING.INVOICE_PAYMENTS, {
      params: { invoiceType, invoiceId },
    });
    return response.data;
  },
};

export default accountingApi;
