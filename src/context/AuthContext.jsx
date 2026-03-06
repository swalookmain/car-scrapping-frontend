import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../services/api';
import refreshAuth from '../services/api/core/refreshService';
import { getDefaultRoute } from '../config/roleConfig';
import tokenStorage from '../services/tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const parsedUser = tokenStorage.getUser();

      if (parsedUser && accessToken) {
        setUser(parsedUser);
        scheduleRefresh(accessToken);
      }
    } catch (err) {
      // Corrupted storage data - clear it
      console.error('Failed to restore session:', err);
      tokenStorage.clearAll();
    }
    setLoading(false);
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      return null;
    }
  };

  const clearScheduledRefresh = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const refreshTokens = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      console.debug('AuthContext: starting token refresh');
      const { accessToken, newRefreshToken, newUser } = await refreshAuth();

      if (newUser) setUser(newUser);

      if (accessToken) scheduleRefresh(accessToken);

      isRefreshingRef.current = false;
      return { accessToken, newRefreshToken };
    } catch (error) {
      isRefreshingRef.current = false;
      tokenStorage.clearAll();
      setUser(null);
      window.location.href = '/';
      throw error;
    }
  };

  const scheduleRefresh = (accessToken) => {
    clearScheduledRefresh();
    if (!accessToken) return;

    const payload = parseJwt(accessToken);
    if (!payload || !payload.exp) {
      // cannot parse expiry; fallback to not scheduling
      return;
    }

    const expiresAtMs = payload.exp * 1000;
    const now = Date.now();
    const bufferMs = 60 * 1000; // refresh 60s before expiry
    let timeout = expiresAtMs - now - bufferMs;

    if (timeout <= 0) {
      // token already near/expired -> refresh immediately
      timeout = 0;
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshTokens().catch((e) => console.error('Scheduled refresh failed', e));
    }, timeout);
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);

    const { accessToken, user: userData } = response;

    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setUser(userData);

    setUser(userData);

    // schedule refresh based on the returned access token
    if (accessToken) scheduleRefresh(accessToken);

    return {
      user: userData,
      redirectPath: getDefaultRoute(userData.role),
    };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearAll();
      clearScheduledRefresh();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
