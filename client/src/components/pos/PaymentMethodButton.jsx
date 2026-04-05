// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/PaymentMethodButton.jsx
import React from 'react';

export const PaymentMethodButton = ({ method, isSelected, amount, onSelect, onRemove }) => {
  if (isSelected) {
    return (
      <div className="flex items-center justify-between p-4 bg-amber-600/20 border border-amber-500 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shrink-0">
            ✓
          </div>
          <div>
            <h4 className="text-amber-500 font-semibold">{method.name}</h4>
            <p className="text-xs text-amber-400/80">Selected for payment</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-white">${Number(amount || 0).toFixed(2)}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(method.id); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(method)}
      className="w-full flex items-center p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left"
    >
      <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center mr-4 text-gray-400 shrink-0 text-xl">
        {method.type === 'CASH' ? '💵' : method.type === 'UPI' ? '📱' : '💳'}
      </div>
      <div>
        <h4 className="text-gray-200 font-medium">{method.name}</h4>
        <p className="text-xs text-gray-500">{method.type}</p>
      </div>
    </button>
  );
};
