// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useOrders.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/orders?sessionId=&status=&tableId= ──────────────────────────────
  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/orders', { params: filters });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── GET /api/orders/:id ──────────────────────────────────────────────────────
  const getOrder = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch order';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/orders ──────────────────────────────────────────────────────────
  const createOrder = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', payload);
      toast.success('Order created');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create order';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/orders/:id ───────────────────────────────────────────────────────
  const updateOrder = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/orders/${id}`, payload);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update order';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE /api/orders/:id (cancel DRAFT) ────────────────────────────────────
  const deleteOrder = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.delete(`/orders/${id}`);
      toast.success('Order cancelled');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel order';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchOrders, getOrder, createOrder, updateOrder, deleteOrder, loading, error };
};
