import axios from 'axios';
import toast from 'react-hot-toast';
import API_CONFIG from './config';
import refreshAuth from './refreshService';
import tokenStorage from '../../tokenStorage';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Request Interceptor ────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Centralized error message extractor ────────────────────────
const getErrorMessage = (error) => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (error.message === 'Network Error') return 'Network error. Please check your connection.';
    return 'An unexpected error occurred.';
  }

  const { status, data } = error.response;
  const serverMessage = data?.message || data?.error || '';

  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input.';
    case 403:
      return serverMessage || 'You do not have permission to perform this action.';
    case 404:
      return serverMessage || 'The requested resource was not found.';
    case 409:
      return serverMessage || 'A conflict occurred. The resource may already exist.';
    case 422:
      return serverMessage || 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please slow down.';
    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again later.';
    default:
      return serverMessage || `Request failed (${status}).`;
  }
};

// ── Response Interceptor ───────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 401 → attempt token refresh ────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.debug('axiosInstance: 401 received, attempting refresh');
        const { accessToken } = await refreshAuth();
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearAll();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // ── Centralized error toast (skip if caller opts out) ──────
    if (!originalRequest._silentError) {
      const message = getErrorMessage(error);
      // Prevent duplicate toasts for the same message
      toast.error(message, { id: `api-error-${error.response?.status || 'network'}` });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
