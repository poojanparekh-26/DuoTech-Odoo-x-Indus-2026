// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/kitchen/KitchenDisplayPage.jsx
import React from 'react';
import { KitchenColumn } from '../../components/kitchen/KitchenColumn';
import { useKitchen } from '../../hooks/useKitchen';

export const KitchenDisplayPage = () => {
  const { orders, loading, updateOrderStatus, toggleItemPrepared } = useKitchen();

  return (
    <div className="h-screen bg-gray-900 p-6 flex flex-col overflow-hidden">
      <h1 className="text-2xl font-bold text-amber-500 mb-6 shrink-0">Kitchen Display System</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        <KitchenColumn 
          title="To Cook" 
          status="TO_COOK" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
        <KitchenColumn 
          title="Preparing" 
          status="PREPARING" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
        <KitchenColumn 
          title="Completed" 
          status="COMPLETED" 
          orders={orders} 
          onStatusChange={updateOrderStatus} 
          onItemToggle={toggleItemPrepared} 
        />
      </div>
    </div>
  );
};
