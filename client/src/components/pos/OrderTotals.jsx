// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/OrderTotals.jsx
import React from 'react';

export const OrderTotals = ({ subtotal, taxAmount, total }) => {
  return (
    <div className="flex flex-col gap-2 py-4 border-t border-gray-700 text-sm">
      <div className="flex justify-between text-gray-400">
        <span>Subtotal</span>
        <span>${Number(subtotal).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-400">
        <span>Tax</span>
        <span>${Number(taxAmount).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-white text-xl font-bold mt-2 pt-2 border-t border-gray-700">
        <span>Total</span>
        <span className="text-amber-500">${Number(total).toFixed(2)}</span>
      </div>
    </div>
  );
};
