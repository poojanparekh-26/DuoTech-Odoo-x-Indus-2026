// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useCustomers.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const useCustomers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/customers?search=&page=&limit= ──────────────────────────────────
  const fetchCustomers = async (search, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const { data } = await api.get('/customers', { params });
      // Return { customers, pagination } so callers can access both
      return { customers: data.data, pagination: data.pagination };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch customers';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/customers ───────────────────────────────────────────────────────
  const createCustomer = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/customers', payload);
      toast.success('Customer created');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create customer';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/customers/:id ────────────────────────────────────────────────────
  const updateCustomer = async (id, payload) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/customers/${id}`, payload);
      toast.success('Customer updated');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update customer';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchCustomers, createCustomer, updateCustomer, loading, error };
};
