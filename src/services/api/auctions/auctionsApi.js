import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const auctionsApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.GET_ALL, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.GET_BY_ID(id));
    return response.data;
  },
  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.CREATE, payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.UPDATE(id), payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.AUCTIONS.DELETE(id));
    return response.data;
  },
  closeDeal: async (id) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.CLOSE_DEAL(id));
    return response.data;
  },
  updateStatus: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.UPDATE_STATUS(id), payload);
    return response.data;
  },
  cancel: async (id, payload) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.CANCEL(id), payload);
    return response.data;
  },
  getLookup: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.LOOKUP);
    return response.data;
  },
  getLookupById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.LOOKUP_BY_ID(id));
    return response.data;
  },
  addLot: async (auctionId, payload) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.LOTS(auctionId), payload);
    return response.data;
  },
  updateLot: async (lotId, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.UPDATE_LOT(lotId), payload);
    return response.data;
  },
  deleteLot: async (lotId) => {
    const response = await axiosInstance.delete(ENDPOINTS.AUCTIONS.DELETE_LOT(lotId));
    return response.data;
  },
  addVehicle: async (lotId, payload) => {
    const response = await axiosInstance.post(
      ENDPOINTS.AUCTIONS.LOT_VEHICLES(lotId),
      payload,
    );
    return response.data;
  },
  addVehiclesBatch: async (lotId, payload) => {
    const response = await axiosInstance.post(
      ENDPOINTS.AUCTIONS.LOT_VEHICLES_BATCH(lotId),
      payload,
    );
    return response.data;
  },
  updateVehicle: async (id, payload) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.AUCTIONS.UPDATE_VEHICLE(id),
      payload,
    );
    return response.data;
  },
  deleteVehicle: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.AUCTIONS.DELETE_VEHICLE(id));
    return response.data;
  },
  uploadVehicleImages: async (vehicleId, formData) => {
    const response = await axiosInstance.post(
      ENDPOINTS.AUCTIONS.VEHICLE_IMAGES(vehicleId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
  getVehicleImages: async (vehicleId) => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.VEHICLE_IMAGES(vehicleId));
    return response.data;
  },
  getLifecycle: async (auctionId) => {
    const response = await axiosInstance.get(ENDPOINTS.AUCTIONS.LIFECYCLE(auctionId));
    return response.data;
  },
  updateLotOutcome: async (auctionId, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.LOT_OUTCOME(auctionId), payload);
    return response.data;
  },
  recordLotPayment: async (lotId, payload) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.LOT_PAYMENT(lotId), payload);
    return response.data;
  },
  updateAcceptanceLetter: async (lotId, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.LOT_ACCEPTANCE(lotId), payload);
    return response.data;
  },
  updateLotDelivery: async (lotId, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.LOT_DELIVERY(lotId), payload);
    return response.data;
  },
  uploadGatePass: async (lotId, formData) => {
    const response = await axiosInstance.post(ENDPOINTS.AUCTIONS.LOT_GATE_PASS(lotId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateLotRcm: async (lotId, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.AUCTIONS.LOT_RCM(lotId), payload);
    return response.data;
  },
};

export default auctionsApi;
