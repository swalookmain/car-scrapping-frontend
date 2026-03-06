import axios from 'axios';
import API_CONFIG, { ENDPOINTS } from './config';
import tokenStorage from '../../tokenStorage';

let _inflightRefresh = null;

export const refreshAuth = async () => {
  if (_inflightRefresh) return _inflightRefresh;

  _inflightRefresh = (async () => {
    try {
      // Read refreshToken from cookies if available (httpOnly cookies are not accessible here,
      // but non-httpOnly ones set by the server may be.)
      let refreshTokenFromCookie = null;
      const cookieMatch = document.cookie.match(/(^|;)\s*refreshToken=([^;]*)/);
      if (cookieMatch) {
        refreshTokenFromCookie = decodeURIComponent(cookieMatch[2]);
      }

      const currentAccess = tokenStorage.getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      const config = { withCredentials: true, headers };

      // Include current access token in Authorization header when available.
      if (currentAccess) {
        config.headers.Authorization = `Bearer ${currentAccess}`;
      }

      // Send refreshToken in payload if available
      const payload = refreshTokenFromCookie ? { refreshToken: refreshTokenFromCookie } : {};

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
        payload,
        config
      );

      const { accessToken, refreshToken: newRefreshToken, user: newUser } = response?.data || {};

      if (accessToken) {
        tokenStorage.setAccessToken(accessToken);
      }
      if (newRefreshToken) {
        tokenStorage.setRefreshToken(newRefreshToken);
      }
      if (newUser) {
        tokenStorage.setUser(newUser);
      }

      return { accessToken, newRefreshToken, newUser };
    } catch (err) {
      console.error('refreshAuth failed:', err?.response?.data?.message || err?.message || 'Unknown error');
      throw err;
    } finally {
      _inflightRefresh = null;
    }
  })();

  return _inflightRefresh;
};

export default refreshAuth;
