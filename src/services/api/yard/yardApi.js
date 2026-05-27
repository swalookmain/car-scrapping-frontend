import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const yardApi = {
  getVehicles: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.YARD.VEHICLES, { params });
    return response.data;
  },
  getVehicleById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.YARD.VEHICLE_BY_ID(id));
    return response.data;
  },
  getByVehicleInvoiceId: async (vehicleInvoiceId) => {
    const response = await axiosInstance.get(
      ENDPOINTS.YARD.BY_VEHICLE_INVOICE(vehicleInvoiceId),
    );
    return response.data;
  },
  getMovements: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.YARD.MOVEMENTS(id));
    return response.data;
  },
  updateStatus: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.YARD.UPDATE_STATUS(id), payload);
    return response.data;
  },
  startDismantling: async (vehicleInvoiceId) => {
    const response = await axiosInstance.post(
      ENDPOINTS.YARD.START_DISMANTLING(vehicleInvoiceId),
    );
    return response.data;
  },
  getDashboard: async () => {
    const response = await axiosInstance.get(ENDPOINTS.YARD.DASHBOARD);
    return response.data;
  },
  getZones: async () => {
    const response = await axiosInstance.get(ENDPOINTS.YARD.ZONES);
    return response.data;
  },
  backfill: async (invoiceId) => {
    const response = await axiosInstance.post(ENDPOINTS.YARD.BACKFILL, null, {
      params: { invoiceId },
    });
    return response.data;
  },
};

export default yardApi;
