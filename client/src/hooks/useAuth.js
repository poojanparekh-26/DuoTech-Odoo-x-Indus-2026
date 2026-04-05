// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useAuth.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const authLogin  = useAuthStore((s) => s.login);
  const authLogout = useAuthStore((s) => s.logout);

  // ── POST /api/auth/login ────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      authLogin(data.data.user, data.data.token);
      return data.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/auth/signup ───────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      authLogin(data.data.user, data.data.token);
      return data.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/auth/logout ───────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Always clear local state even if server call fails
    } finally {
      authLogout();
      setLoading(false);
    }
  };

  // ── GET /api/auth/me ────────────────────────────────────────────────────────
  const getCurrentUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (_) {
      return useAuthStore.getState().user;
    }
  };

  return { login, signup, logout, getCurrentUser, loading, error };
};
