// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/TableCard.jsx
import React from 'react';
import { Badge } from '../ui/Badge';

export const TableCard = ({ table, hasOrder, orderTotal, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 border-2 ${
        hasOrder 
          ? 'bg-gray-700 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
          : 'bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600'
      }`}
    >
      <span className="text-gray-400 text-sm font-medium absolute top-3 left-3">Table</span>
      <span className="text-4xl font-bold text-blue-400 my-4">{table?.table_number}</span>
      <span className="text-xs text-gray-500 absolute top-3 right-3">{table?.seats} Seats</span>
      
      {hasOrder && (
        <div className="absolute bottom-3">
          <Badge label={`Amount: $${orderTotal || '0.00'}`} variant="success" />
        </div>
      )}
    </div>
  );
};
