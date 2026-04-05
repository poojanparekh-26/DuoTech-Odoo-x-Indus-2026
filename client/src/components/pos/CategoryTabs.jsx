// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/CategoryTabs.jsx
import React from 'react';

export const CategoryTabs = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide shrink-0">
      <button
        onClick={() => onSelect('all')}
        className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
          activeCategory === 'all' 
            ? 'bg-amber-600 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        All Items
      </button>
      {categories?.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            activeCategory === cat.id ? 'text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          style={{ backgroundColor: activeCategory === cat.id ? (cat.color || '#3B82F6') : undefined }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
