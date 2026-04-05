// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/ProductCard.jsx
import React from 'react';

export const ProductCard = ({ product, onAdd }) => {
  return (
    <div
      onClick={() => onAdd(product)}
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border-l-4 shadow-sm flex flex-col justify-between h-full"
      style={{ borderLeftColor: product?.category?.color || '#3B82F6' }}
    >
      <div>
        <h4 className="text-gray-200 font-medium line-clamp-2">{product.name}</h4>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-amber-500 font-bold">${Number(product.price).toFixed(2)}</span>
      </div>
    </div>
  );
};
