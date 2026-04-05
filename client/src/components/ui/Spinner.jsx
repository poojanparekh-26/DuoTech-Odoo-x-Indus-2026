// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/Spinner.jsx
import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`rounded-full animate-spin border-amber-500 border-t-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};
