// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useFloors.js
import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useFloors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/floors?posId= ───────────────────────────────────────────────────
  const fetchFloors = useCallback(async (posId) => {
    setLoading(true);
    setError(null);
    try {
      const params = posId ? { posId } : {};
      const { data } = await api.get('/floors', { params });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch floors';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /api/floors/:id ──────────────────────────────────────────────────────
  const fetchFloor = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/floors/${id}`);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch floor';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /api/floors ─────────────────────────────────────────────────────────
  const createFloor = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/floors', payload);
      toast.success('Floor created');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create floor';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/floors/:id ──────────────────────────────────────────────────────
  const updateFloor = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/floors/${id}`, payload);
      toast.success('Floor updated');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update floor';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE /api/floors/:id ───────────────────────────────────────────────────
  const deleteFloor = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/floors/${id}`);
      toast.success('Floor deleted');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete floor';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchFloors, fetchFloor, createFloor, updateFloor, deleteFloor, loading, error };
};
