// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/Badge.jsx
import React from 'react';

export const Badge = ({ label, variant = 'default' }) => {
  const variantStyles = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    default: 'bg-gray-700 text-gray-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variantStyles[variant]}`}>
      {label}
    </span>
  );
};
