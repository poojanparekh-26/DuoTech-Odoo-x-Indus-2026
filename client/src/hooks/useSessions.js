// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useSessions.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useSessions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/sessions?posId=&status= ─────────────────────────────────────────
  const fetchSessions = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/sessions', { params: filters });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch sessions';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/sessions ────────────────────────────────────────────────────────
  const openSession = async ({ posId, openingCash = 0 }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/sessions', { posId, openingCash });
      toast.success('Session opened');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to open session';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/sessions/:id  (close: status=CLOSED) ────────────────────────────
  const closeSession = async (id, closingCash = 0) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/sessions/${id}`, {
        status: 'CLOSED',
        closingCash,
      });
      toast.success('Session closed');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to close session';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchSessions, openSession, closeSession, loading, error };
};
