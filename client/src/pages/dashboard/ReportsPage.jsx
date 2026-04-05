// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/ReportsPage.jsx
import React, { useEffect, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { KPICard } from '../../components/dashboard/KPICard';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { TopProductsTable } from '../../components/dashboard/TopProductsTable';
import { Button } from '../../components/ui/Button';

export const ReportsPage = () => {
  const { fetchDashboard, loading } = useReports();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard().then(res => res && setData(res));
  }, [fetchDashboard]);

  const totals      = data?.totals      ?? {};
  const chartData   = data?.salesByDay  ?? [{ date: 'Mon', total: 400 }, { date: 'Tue', total: 600 }];
  const topProducts = data?.topProducts ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
        <h1 className="text-xl font-bold text-white sm:hidden">Reports</h1>
        <div className="flex gap-4 flex-wrap">
          <select className="bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 text-sm font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <select className="bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 text-sm font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
            <option>All Sessions</option>
            <option>POS-Main-01</option>
          </select>
        </div>
        <Button variant="primary" className="!bg-emerald-600 hover:!bg-emerald-500 shadow-lg">⬇ Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Sales" value={`₹${Number(totals.totalSales ?? 0).toFixed(2)}`} />
        <KPICard title="Total Orders" value={totals.totalOrders ?? 0} />
        <KPICard title="Cost of Goods" value="₹0.00" />
        <KPICard title="Net Profit" value={`₹${Number(totals.totalSales ?? 0).toFixed(2)}`} />
      </div>
      
      <div className="w-full">
        <SalesChart data={chartData} />
      </div>
      
      <div className="w-full">
        <TopProductsTable data={topProducts} />
      </div>
    </div>
  );
};
