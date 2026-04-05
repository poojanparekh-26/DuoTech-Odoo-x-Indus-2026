// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/CartItem.jsx
import React from 'react';

export const CartItem = ({ item, onQtyChange, onRemove }) => {
  return (
    <div className="flex flex-col py-3 border-b border-gray-700 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <h4 className="text-sm font-medium text-gray-200 truncate">{item.name}</h4>
          {item.notes && <p className="text-xs text-gray-400 truncate mt-0.5">Note: {item.notes}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800 rounded p-1">
            <button 
              onClick={() => onQtyChange(item.id, Math.max(1, item.quantity - 1))}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
            <button 
              onClick={() => onQtyChange(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
            >
              +
            </button>
          </div>
          <div className="w-16 text-right">
            <span className="text-sm font-medium text-amber-500">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-400 p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
