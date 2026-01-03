import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';

const API_BASE = 'http://localhost:3001/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Load token from localStorage on init
    try {
      return localStorage.getItem('auth_user_token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to make authenticated requests
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      const err = new Error(data.message || 'Request failed');
      err.status = response.status;
      err.code = data.code;
      err.data = data;
      throw err;
    }
    
    return data;
  }, [token]);

  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      try {
        localStorage.setItem('auth_user_token', newToken);
      } catch {}
    } else {
      try {
        localStorage.removeItem('auth_user_token');
      } catch {}
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        const err = new Error(data.message || 'Login failed');
        err.status = res.status;
        err.code = data.code;
        throw err;
      }

      const userToken = data?.data?.user_token;
      const userData = data?.data?.user;
      
      if (userToken) {
        saveToken(userToken);
      }
      setUser(userData || null);
      return userData || null;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToken]);

  const googleLogin = useCallback(async (idToken) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        const err = new Error(data.message || 'Google login failed');
        err.status = res.status;
        err.code = data.code;
        throw err;
      }

      const userToken = data?.data?.user_token;
      const userData = data?.data?.user;
      
      if (userToken) {
        saveToken(userToken);
      }
      setUser(userData || null);
      return { user: userData, isNewUser: data?.data?.is_new_user };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToken]);

  const logout = useCallback(() => {
    setUser(null);
    saveToken(null);
  }, [saveToken]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall('/user/profile', { method: 'GET' });
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, apiCall]);

  // Create authClient-like object for compatibility with existing components
  const authClient = useMemo(() => ({
    register: async ({ email, username, password, name, ...extra }) => {
      return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, name, ...extra }),
      });
    },
    requestPasswordReset: async ({ email }) => {
      return apiCall('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    requestChangePasswordLink: async ({ email }) => {
      return apiCall('/auth/request-change-password-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    resendVerificationEmail: async ({ email, purpose }) => {
      return apiCall('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      });
    },
    deleteAccount: async ({ email, password }) => {
      return apiCall('/auth/delete-account', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    sendGoogleUserSetPasswordEmail: async ({ email }) => {
      return apiCall('/auth/set-password-google-user', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    updateProfile: async (updates) => {
      return apiCall('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    getProfile: async () => {
      return apiCall('/user/profile', { method: 'GET' });
    },
  }), [apiCall]);

  const value = useMemo(
    () => ({ authClient, user, token, login, googleLogin, logout, refreshProfile, loading, error }),
    [authClient, user, token, login, googleLogin, logout, refreshProfile, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
