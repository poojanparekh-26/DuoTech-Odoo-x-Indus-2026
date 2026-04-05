// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden font-sans text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
