// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useProducts.js
import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── GET /api/products?categoryId=&isActive= ─────────────────────────────────
  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', { params: filters });
      setProducts(data.data);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch products';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /api/products ───────────────────────────────────────────────────────
  const createProduct = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/products', payload);
      setProducts((prev) => [data.data, ...prev]);
      toast.success('Product created');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create product';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/products/:id ────────────────────────────────────────────────────
  const updateProduct = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/products/${id}`, payload);
      setProducts((prev) => prev.map((p) => (p.id === id ? data.data : p)));
      toast.success('Product updated');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update product';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE /api/products/:id (soft delete) ───────────────────────────────────
  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deactivated');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete product';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};
