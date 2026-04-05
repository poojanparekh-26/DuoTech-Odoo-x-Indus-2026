// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800 p-4 border-r border-slate-700">
        <h1 className="text-xl font-bold mb-4 text-emerald-400">Odoo POS</h1>
        <p className="text-gray-400 text-sm">Dashboard Navigation</p>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
