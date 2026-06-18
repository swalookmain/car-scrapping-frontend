import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';
import API_CONFIG from '../core/config';

const authorizationLettersApi = {
  list: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AUTHORIZATION_LETTERS.GET_ALL);
    return response.data;
  },
  getEligibleAuctions: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AUTHORIZATION_LETTERS.ELIGIBLE_AUCTIONS);
    return response.data;
  },
  getEligibility: async (auctionId) => {
    const response = await axiosInstance.get(
      ENDPOINTS.AUTHORIZATION_LETTERS.AUCTION_ELIGIBILITY(auctionId),
    );
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.AUTHORIZATION_LETTERS.GET_BY_ID(id));
    return response.data;
  },
  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTHORIZATION_LETTERS.CREATE, payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.AUTHORIZATION_LETTERS.UPDATE(id),
      payload,
    );
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.AUTHORIZATION_LETTERS.DELETE(id));
    return response.data;
  },
  getPreviewUrl: (id) =>
    `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTHORIZATION_LETTERS.PREVIEW(id)}`,
  downloadPdf: async (id, filename = 'authorization-letter.pdf') => {
    const response = await axiosInstance.get(ENDPOINTS.AUTHORIZATION_LETTERS.PDF(id), {
      responseType: 'blob',
      _silentError: true,
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return response.data;
  },
};

export default authorizationLettersApi;
