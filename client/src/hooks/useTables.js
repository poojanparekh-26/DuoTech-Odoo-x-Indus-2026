import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useTables = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTable = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tables/${id}`);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch table';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTable = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/tables/${id}`, payload);
      toast.success('Table updated');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update table';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchTable, updateTable, loading, error };
};
