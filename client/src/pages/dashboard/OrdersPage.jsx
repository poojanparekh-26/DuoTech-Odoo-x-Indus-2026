// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/OrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const OrdersPage = () => {
  const { fetchOrders, loading } = useOrders();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const statusParam = filter === 'All' ? undefined : filter.toUpperCase();
    fetchOrders({ status: statusParam }).then(o => o && setOrders(o));
  }, [filter]);

  const columns = [
    { key: 'order_number', label: 'Order No.', render: r => <span className="font-bold text-gray-200">{r.order_number}</span> },
    { key: 'user_name', label: 'Cashier', render: r => r.user_name || '—' },
    { key: 'created_at', label: 'Date', render: r => new Date(r.created_at).toLocaleString() },
    { key: 'total', label: 'Total', render: r => <span className="font-semibold text-amber-400">₹{Number(r.total).toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (r) => r.status === 'PAID' ? <Badge label="Paid" variant="success" /> : r.status === 'CANCELLED' ? <Badge label="Cancelled" variant="danger" /> : <Badge label="Draft" variant="warning" /> },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] max-w-[1600px] mx-auto">
      <div className={`flex flex-col flex-1 transition-all ${selectedOrder ? 'w-1/2' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white shrink-0">Orders History</h1>
          <div className="flex bg-gray-800 p-1 rounded-lg">
            {['All', 'Draft', 'Paid'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === tab ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <DataTable 
          columns={columns} 
          data={orders} 
          loading={loading} 
          onRowClick={(row) => setSelectedOrder(row)}
        />
      </div>

      {selectedOrder && (
        <div className="w-1/3 min-w-[350px] bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex flex-col h-full overflow-hidden shrink-0 animate-slide-in">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
            <h2 className="text-lg font-bold text-white">Order Details</h2>
            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          
          <div className="flex border-b border-gray-700">
            <button className="flex-1 py-3 text-sm font-medium text-amber-500 border-b-2 border-amber-500 bg-gray-800/50">Products</button>
            <button className="flex-1 py-3 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">Extra Info</button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
               <table className="w-full text-sm text-left text-gray-300">
                 <thead className="text-xs text-gray-500 border-b border-gray-700">
                   <tr>
                     <th className="pb-2">Product</th>
                     <th className="pb-2 text-right">Qty</th>
                     <th className="pb-2 text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-700/50">
                   {(selectedOrder?.items ?? []).length === 0
                     ? <tr><td colSpan={3} className="py-4 text-center text-gray-500 italic">No items</td></tr>
                     : (selectedOrder?.items ?? []).map(item => (
                         <tr key={item.id}>
                           <td className="py-3 font-medium text-gray-200">{item.name}</td>
                           <td className="py-3 text-right">{item.quantity}x</td>
                           <td className="py-3 text-right font-medium">₹{Number(item.subtotal).toFixed(2)}</td>
                         </tr>
                       ))
                   }
                 </tbody>
               </table>
            </div>
            
            <div className="p-5 border-t border-gray-700 bg-gray-900/80">
              <div className="flex justify-between text-gray-400 text-sm mb-2">
                <span>Subtotal</span><span className="font-medium text-white">₹{Number(selectedOrder?.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm mb-4">
                <span>Tax</span><span className="font-medium text-white">₹{Number(selectedOrder?.tax_amount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white text-xl font-bold border-t border-gray-700 pt-4">
                <span>Final Total</span>
                <span className="text-amber-500">₹{Number(selectedOrder?.total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
