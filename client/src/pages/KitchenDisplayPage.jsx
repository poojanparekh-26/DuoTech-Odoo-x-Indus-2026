// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/KitchenDisplayPage.jsx
import React, { useEffect } from 'react';
import { KitchenColumn } from '../components/kitchen/KitchenColumn';
import { useKitchen } from '../hooks/useKitchen';

export const KitchenDisplayPage = () => {
  const { orders, fetchKitchenOrders, updateOrderStatus, toggleItemPrepared, loading } = useKitchen();

  useEffect(() => {
    fetchKitchenOrders();
  }, []);

  return (
    <div className="h-screen bg-gray-900 p-6 flex flex-col overflow-hidden font-sans">
      <div className="flex justify-between items-center mb-6 shrink-0">
         <h1 className="text-3xl font-bold text-amber-500 tracking-wider uppercase">Kitchen Display</h1>
         <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-gray-400 text-sm font-medium uppercase">Live</span>
         </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        <KitchenColumn 
          title={<span className="text-red-400 font-bold uppercase tracking-widest">To Cook</span>} 
          status="TO_COOK" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
        <KitchenColumn 
          title={<span className="text-yellow-400 font-bold uppercase tracking-widest">Preparing</span>} 
          status="PREPARING" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
        <KitchenColumn 
          title={<span className="text-green-400 font-bold uppercase tracking-widest">Completed</span>} 
          status="COMPLETED" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
      </div>
    </div>
  );
};
