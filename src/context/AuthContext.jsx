import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../services/api';
import refreshAuth from '../services/api/core/refreshService';
import { getDefaultRoute } from '../config/roleConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      scheduleRefresh(accessToken);
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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

    const { accessToken, refreshToken, user: userData } = response;

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
    localStorage.setItem('user', JSON.stringify(userData));

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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
