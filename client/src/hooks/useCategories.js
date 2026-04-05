// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useCategories.js
import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // ── GET /api/categories ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch categories';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /api/categories ─────────────────────────────────────────────────────
  const createCategory = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/categories', payload);
      setCategories((prev) => [data.data, ...prev]);
      toast.success('Category created');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create category';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/categories/:id ──────────────────────────────────────────────────
  const updateCategory = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/categories/${id}`, payload);
      setCategories((prev) => prev.map((c) => (c.id === id ? data.data : c)));
      toast.success('Category updated');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update category';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE /api/categories/:id ───────────────────────────────────────────────
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete category';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
