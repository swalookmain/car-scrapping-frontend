/**
 * Token Storage Utility — sessionStorage wrapper
 *
 * Why sessionStorage instead of localStorage?
 * ─────────────────────────────────────────────
 * • sessionStorage is automatically cleared when the browser tab is closed,
 *   which limits the window of exposure if an XSS attack occurs.
 * • sessionStorage is NOT shared across tabs, so a compromised tab cannot
 *   steal tokens from another tab's session.
 *
 * Ideal future solution: httpOnly + Secure cookies set server-side so the
 * frontend never touches the token at all. That requires backend changes.
 */

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

export const tokenStorage = {
  // ── Access Token ──────────────────────────────────────────────
  getAccessToken: () => sessionStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token) => sessionStorage.setItem(KEYS.ACCESS_TOKEN, token),
  removeAccessToken: () => sessionStorage.removeItem(KEYS.ACCESS_TOKEN),

  // ── Refresh Token ─────────────────────────────────────────────
  getRefreshToken: () => sessionStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => sessionStorage.setItem(KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => sessionStorage.removeItem(KEYS.REFRESH_TOKEN),

  // ── User Object ───────────────────────────────────────────────
  getUser: () => {
    try {
      const raw = sessionStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => sessionStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: () => sessionStorage.removeItem(KEYS.USER),

  // ── Clear All ─────────────────────────────────────────────────
  clearAll: () => {
    sessionStorage.removeItem(KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(KEYS.USER);
  },
};

export default tokenStorage;
