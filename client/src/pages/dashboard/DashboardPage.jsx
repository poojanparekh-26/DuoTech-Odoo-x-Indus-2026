// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { KPICard } from '../../components/dashboard/KPICard';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { TopProductsTable } from '../../components/dashboard/TopProductsTable';
import { Button } from '../../components/ui/Button';

export const DashboardPage = () => {
  const { fetchDashboard, loading } = useReports();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard().then(res => res && setData(res));
  }, []);

  const totals      = data?.totals      ?? {};
  const chartData   = data?.salesByDay  ?? [];
  const topProducts = data?.topProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-bold text-white shrink-0">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button variant="primary" size="sm">Today</Button>
          <Button variant="ghost" size="sm">This Week</Button>
          <Button variant="ghost" size="sm">This Month</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Sales" value={`₹${Number(totals.totalSales ?? 0).toFixed(2)}`} subtitle="Paid orders" />
        <KPICard title="Total Orders" value={totals.totalOrders ?? 0} subtitle="Paid orders" />
        <KPICard title="Avg Order Value" value={`₹${Number(totals.avgOrderValue ?? 0).toFixed(2)}`} />
        <KPICard title="Total Tax" value={`₹${Number(totals.totalTax ?? 0).toFixed(2)}`} />
      </div>
      
      <div className="w-full overflow-hidden">
        <SalesChart data={chartData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <TopProductsTable data={topProducts} />
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col h-full">
          <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-4 mb-4">Recent Orders (Last 10)</h3>
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length === 0
              ? <p className="text-sm text-gray-500 italic text-center mt-4">No recent orders.</p>
              : recentOrders.map(o => (
                  <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-700 text-sm">
                    <span className="text-gray-300 font-mono">{o.order_number}</span>
                    <span className="text-gray-400">{o.table_number ? `Table ${o.table_number}` : 'Takeaway'}</span>
                    <span className="text-amber-400 font-semibold">₹{Number(o.total).toFixed(2)}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
