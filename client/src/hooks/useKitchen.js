// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\client\src\hooks\useKitchen.js
import { useState, useEffect } from 'react';
import { toast } from '../components/ui/Toast';
import api from '../lib/api';
import { socket } from '../lib/socket';

export const useKitchen = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── GET /api/kitchen/orders?status= ──────────────────────────────────────────
  const fetchKitchenOrders = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/kitchen/orders', { params });
      setOrders(data.data);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch kitchen orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/kitchen/orders/:id/status ────────────────────────────────────────
  const updateOrderStatus = async (orderId, kitchenStatus) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/kitchen/orders/${orderId}/status`, {
        kitchenStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...data.data } : o))
      );
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update order status';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── PUT /api/kitchen/orders/:id/items/:itemId ─────────────────────────────────
  const toggleItemPrepared = async (orderId, itemId) => {
    try {
      const { data } = await api.put(
        `/kitchen/orders/${orderId}/items/${itemId}`
      );
      // Update the specific item inside its order
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            items: o.items.map((i) =>
              i.id === itemId ? data.data.item : i
            ),
          };
        })
      );
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update item';
      setError(msg);
      toast.error(msg);
      throw err;
    }
  };

  // ── Socket.io listeners (kept exactly as in mock version) ────────────────────
  useEffect(() => {
    socket.emit('join:kitchen');

    const handleNewOrder = (order) => {
      setOrders((prev) => [...prev, order]);
    };

    const handleStatusUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    };

    socket.on('kitchen:new-order',    handleNewOrder);
    socket.on('order:status-updated', handleStatusUpdated);

    return () => {
      socket.off('kitchen:new-order',    handleNewOrder);
      socket.off('order:status-updated', handleStatusUpdated);
    };
  }, []);

  return {
    orders,
    setOrders,
    fetchKitchenOrders,
    updateOrderStatus,
    toggleItemPrepared,
    loading,
    error,
  };
};
