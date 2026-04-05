// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\usePayment.js
import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/payments?sessionId=&orderId= ────────────────────────────────────
  const fetchPayments = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/payments', { params: filters });
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch payments';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/payments ────────────────────────────────────────────────────────
  const createPayment = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments', payload);
      toast.success('Payment recorded');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Payment failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── POST /api/payments/upi-qr ─────────────────────────────────────────────────
  const generateUPIQR = async ({ amount, upiId, orderNumber }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/upi-qr', { amount, upiId, orderNumber });
      return data.data; // { qrDataUrl, upiLink, amount, upiId }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate QR';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── GET /api/payment-methods ──────────────────────────────────────────────────
  const fetchMethods = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payment-methods');
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch methods';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchPayments, createPayment, generateUPIQR, fetchMethods, loading, error };
};
