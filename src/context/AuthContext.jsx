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
    const restore = async () => {
      try {
        const accessToken = tokenStorage.getAccessToken();
        if (!accessToken) {
          setLoading(false);
          return;
        }
        scheduleRefresh(accessToken);
        try {
          const me = await authApi.getMe();
          tokenStorage.setUser(me);
          setUser(me);
        } catch (err) {
          console.error('Failed to restore session from /me:', err);
          tokenStorage.clearAll();
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        tokenStorage.clearAll();
      }
      setLoading(false);
    };
    restore();
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

  const persistSession = async (response) => {
    const { accessToken, user: userData } = response;
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setUser(userData);
    setUser(userData);
    if (accessToken) scheduleRefresh(accessToken);

    let resolved = userData;
    try {
      const me = await authApi.getMe();
      resolved = me;
      tokenStorage.setUser(me);
      setUser(me);
    } catch (err) {
      console.error('Failed to load current user profile:', err);
    }

    return {
      user: resolved,
      redirectPath: getDefaultRoute(resolved.role, resolved.allowedModules),
    };
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    return persistSession(response);
  };

  const signup = async (payload) => {
    const response = await authApi.signup(payload);
    return persistSession(response);
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
    signup,
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
