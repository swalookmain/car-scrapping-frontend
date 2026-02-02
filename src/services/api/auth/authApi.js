import axiosInstance from '../core/axiosInstance';
import axios from 'axios';
import API_CONFIG, { ENDPOINTS } from '../core/config';

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  refreshToken: async () => {
    // Use cookie-based refresh if backend sets an httpOnly cookie.
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};

export default authApi;
