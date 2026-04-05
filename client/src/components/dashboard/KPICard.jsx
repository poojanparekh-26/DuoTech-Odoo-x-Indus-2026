// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/dashboard/KPICard.jsx
import React from 'react';

export const KPICard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-700 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="mt-2 text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-3 bg-gray-700/50 rounded-lg text-amber-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
