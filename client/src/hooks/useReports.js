// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useReports.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/reports/dashboard?from=&to=&sessionId=&userId=&productId= ───────
  const fetchDashboard = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports/dashboard', { params: filters });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── GET /api/reports/export ───────────────────────────────────────────────────
  // Returns full orders with items for client-side CSV generation
  const exportData = async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/export', { params: filters });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to export data';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── GET /api/reports/sessions ─────────────────────────────────────────────────
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/sessions');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch session report';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { fetchDashboard, exportData, fetchSessions, loading, error };
};
