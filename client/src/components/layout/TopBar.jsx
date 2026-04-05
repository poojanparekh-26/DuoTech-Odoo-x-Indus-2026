// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/layout/TopBar.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

export const TopBar = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
    : 'Dashboard';

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </header>
  );
};
