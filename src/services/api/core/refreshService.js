import axios from 'axios';
import API_CONFIG, { ENDPOINTS } from './config';

let _inflightRefresh = null;

export const refreshAuth = async () => {
  if (_inflightRefresh) return _inflightRefresh;

  _inflightRefresh = (async () => {
    try {
      // Always read refreshToken from cookies and send in payload if available
      let refreshTokenFromCookie = null;
      const cookieMatch = document.cookie.match(/(^|;)\s*refreshToken=([^;]*)/);
      if (cookieMatch) {
        refreshTokenFromCookie = decodeURIComponent(cookieMatch[2]);
        console.log('refreshService: found refreshToken in cookie:', refreshTokenFromCookie);
      } else {
        console.log('refreshService: no refreshToken found in accessible cookies');
      }

      const currentAccess = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      const config = { withCredentials: true, headers };

      // Include current access token in Authorization header when available.
      if (currentAccess) {
        config.headers.Authorization = `Bearer ${currentAccess}`;
      }

      // Always send refreshToken in payload if available
      const payload = refreshTokenFromCookie ? { refreshToken: refreshTokenFromCookie } : {};
      console.log('refreshService: calling refresh API with payload:', payload);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
        payload,
        config
      );

      console.debug('refreshService: refresh response', response?.data);

      const { accessToken, refreshToken: newRefreshToken, user: newUser } = response.data || {};

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return { accessToken, newRefreshToken, newUser };
    } catch (err) {
      console.error('refreshAuth failed:', err?.response?.data || err.message || err);
      throw err;
    } finally {
      _inflightRefresh = null;
    }
  })();

  return _inflightRefresh;
};

export default refreshAuth;
