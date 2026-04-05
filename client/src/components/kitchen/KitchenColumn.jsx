// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/kitchen/KitchenColumn.jsx
import React from 'react';
import { KitchenOrderCard } from './KitchenOrderCard';

export const KitchenColumn = ({ title, status, orders, onStatusChange, onItemToggle }) => {
  const columnOrders = orders?.filter(o => o.kitchen_status === status) || [];

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden h-full">
      <div className="px-5 py-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h2 className="text-lg font-semibold text-white tracking-wide">{title}</h2>
        <span className="bg-gray-700 text-amber-500 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
          {columnOrders.length}
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {columnOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 italic">
            No orders
          </div>
        ) : (
          columnOrders.map(order => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={onStatusChange}
              onItemToggle={onItemToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};
