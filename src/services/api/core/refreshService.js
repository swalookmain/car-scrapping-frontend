import axios from 'axios';
import API_CONFIG, { ENDPOINTS } from './config';

let _inflightRefresh = null;

export const refreshAuth = async () => {
  if (_inflightRefresh) return _inflightRefresh;

  _inflightRefresh = (async () => {
    try {
      // Prefer cookie-based refresh (httpOnly cookie). If no cookie is
      // present, fall back to sending a refresh token from localStorage
      // if available (some backends return it during login).
      const storedRefresh = localStorage.getItem('refreshToken');
      const currentAccess = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      const config = { withCredentials: true, headers };

      // Include current access token in Authorization header when available.
      if (currentAccess) {
        config.headers.Authorization = `Bearer ${currentAccess}`;
      }

      // Prepare body fallback: if we have a stored refresh token, send it
      // in the request body as { refreshToken } (some servers expect this).
      const body = storedRefresh ? { refreshToken: storedRefresh } : {};

      // If backend also expects refresh in Authorization, prefer sending access
      // token in Authorization and rely on cookie for refresh token. If only
      // storedRefresh exists, also set as Authorization fallback (older flows).
      if (!currentAccess && storedRefresh) {
        config.headers.Authorization = `Bearer ${storedRefresh}`;
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
        body,
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
