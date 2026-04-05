// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/ColorPicker.jsx
import React from 'react';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

export const ColorPicker = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            value === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};
