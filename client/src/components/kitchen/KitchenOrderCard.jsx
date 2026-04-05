// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/kitchen/KitchenOrderCard.jsx
import React from 'react';
import { Badge } from '../ui/Badge';

export const KitchenOrderCard = ({ order, onStatusChange, onItemToggle }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <Badge label="Pending" variant="warning" />;
      case 'TO_COOK': return <Badge label="Ready to Cook" variant="info" />;
      case 'PREPARING': return <Badge label="Preparing" variant="default" className="bg-purple-500/20 text-purple-400" />;
      case 'COMPLETED': return <Badge label="Completed" variant="success" />;
      default: return <Badge label={status} />;
    }
  };

  const nextStatus = {
    PENDING: 'TO_COOK',
    TO_COOK: 'PREPARING',
    PREPARING: 'COMPLETED'
  };

  const nextLabels = {
    PENDING: 'Accept Order',
    TO_COOK: 'Start Cooking',
    PREPARING: 'Mark Done'
  };

  const elapsed = Math.floor((new Date() - new Date(order.created_at || Date.now())) / 60000);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col shadow-sm">
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white"># {order.order_number || '---'}</h3>
          <p className="text-sm text-gray-400">Table {order.table?.table_number || 'N/A'}</p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${elapsed > 15 ? 'text-red-500' : 'text-gray-300'}`}>
            {elapsed} min
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
        <ul className="space-y-3">
          {order.items?.map(item => (
            <li 
              key={item.id} 
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => onItemToggle?.(order.id, item.id)}
            >
              <div className="mt-0.5 shrink-0">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.is_prepared ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-amber-500'}`}>
                  {item.is_prepared && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
              <div>
                <p className={`font-medium text-sm transition-all ${item.is_prepared ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  <span className="font-bold mr-2 text-amber-500">{item.quantity}x</span> 
                  {item.name}
                </p>
                {item.notes && <p className="text-xs text-red-400 mt-1 italic">Note: {item.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-900 flex items-center justify-between mt-auto">
        {getStatusBadge(order.kitchen_status)}
        {nextStatus[order.kitchen_status] && (
          <button 
            onClick={() => onStatusChange?.(order.id, nextStatus[order.kitchen_status])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors"
          >
            {nextLabels[order.kitchen_status]}
          </button>
        )}
      </div>
    </div>
  );
};
