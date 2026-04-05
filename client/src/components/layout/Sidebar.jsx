// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/dashboard/products', label: 'Products' },
  { path: '/dashboard/categories', label: 'Categories' },
  { path: '/dashboard/floors', label: 'Floors' },
  { path: '/dashboard/orders', label: 'Orders' },
  { path: '/dashboard/payments', label: 'Payments' },
  { path: '/dashboard/customers', label: 'Customers' },
  { path: '/dashboard/reports', label: 'Reports' },
  { path: '/dashboard/settings', label: 'Settings' },
];

export const Sidebar = () => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-[240px] bg-gray-900 h-full flex flex-col border-r border-gray-800 shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-amber-500 tracking-wider">Odoo Cafe</h1>
      </div>
      
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'}
            className={({ isActive }) => 
              `block px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-amber-600/20 text-amber-500 border-l-2 border-amber-500' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 border-l-2 border-transparent'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold uppercase shrink-0 shadow-inner">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role || 'Role'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded hover:text-white hover:bg-gray-700 border border-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
