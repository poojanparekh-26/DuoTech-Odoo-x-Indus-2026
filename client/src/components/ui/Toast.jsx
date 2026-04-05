// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/Toast.jsx
import React, { useState, useEffect } from 'react';

const toastEventEmitter = {
  listeners: [],
  on(fn) { this.listeners.push(fn); },
  off(fn) { this.listeners = this.listeners.filter(l => l !== fn); },
  emit(type, msg) { this.listeners.forEach(fn => fn({ id: Date.now() + Math.random(), type, msg })); }
};

export const toast = {
  success: (msg) => toastEventEmitter.emit('success', msg),
  error: (msg) => toastEventEmitter.emit('error', msg),
  info: (msg) => toastEventEmitter.emit('info', msg),
  warning: (msg) => toastEventEmitter.emit('warning', msg),
};

export const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };
    
    toastEventEmitter.on(handleToast);
    return () => toastEventEmitter.off(handleToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`px-4 py-3 rounded shadow-lg text-white pointer-events-auto transform transition-all translate-x-0 ${
          t.type === 'success' ? 'bg-green-600' : 
          t.type === 'error' ? 'bg-red-600' : 
          t.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
};
