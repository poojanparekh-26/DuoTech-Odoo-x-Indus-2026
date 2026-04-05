// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/Input.jsx
import React from 'react';

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  rightIcon
}) => {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} text-white rounded px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};
