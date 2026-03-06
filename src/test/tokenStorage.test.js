import { describe, it, expect, beforeEach } from 'vitest';
import tokenStorage from '../services/tokenStorage';

const {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getUser,
  setUser,
  removeUser,
  getRefreshToken,
  setRefreshToken,
  clearAll,
} = tokenStorage;

describe('tokenStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('access token', () => {
    it('returns null when no token is stored', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('stores and retrieves access token', () => {
      setAccessToken('my-token-abc');
      expect(getAccessToken()).toBe('my-token-abc');
    });

    it('removes access token', () => {
      setAccessToken('my-token-abc');
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('refresh token', () => {
    it('returns null when no refresh token stored', () => {
      expect(getRefreshToken()).toBeNull();
    });

    it('stores and retrieves refresh token', () => {
      setRefreshToken('refresh-xyz');
      expect(getRefreshToken()).toBe('refresh-xyz');
    });
  });

  describe('user data', () => {
    it('returns null when no user is stored', () => {
      expect(getUser()).toBeNull();
    });

    it('stores and retrieves user object', () => {
      const user = { id: '123', name: 'Alice', role: 'ADMIN' };
      setUser(user);
      expect(getUser()).toEqual(user);
    });

    it('removes user data', () => {
      setUser({ id: '123', name: 'Alice' });
      removeUser();
      expect(getUser()).toBeNull();
    });

    it('returns null for corrupted user JSON', () => {
      sessionStorage.setItem('user', 'not-valid-json{{{');
      expect(getUser()).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('removes all stored tokens and user data', () => {
      setAccessToken('token');
      setRefreshToken('refresh');
      setUser({ id: '1', name: 'Bob' });

      clearAll();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(getUser()).toBeNull();
    });
  });
});
