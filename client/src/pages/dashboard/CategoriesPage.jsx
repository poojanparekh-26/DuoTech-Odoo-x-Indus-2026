// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/CategoriesPage.jsx
import React, { useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { DataTable } from '../../components/ui/DataTable';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

export const CategoriesPage = () => {
  const { categories, fetchCategories, loading } = useCategories();

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const columns = [
    { key: 'name', label: 'Category Name', render: (row) => <span className="font-semibold text-gray-200">{row.name}</span> },
    { 
      key: 'color', 
      label: 'Designation Color', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md shadow-sm border border-gray-600" style={{ backgroundColor: row.color }}></div>
          <span className="text-gray-500 text-xs uppercase">{row.color}</span>
        </div>
      ) 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">Edit</button>
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <Button variant="primary" onClick={async () => {
          const name = window.prompt('Enter category name:');
          if (name) {
            const color = window.prompt('Enter category color hex:') || '#000000';
            await api.post('/categories', { name, color });
            fetchCategories();
          }
        }}>+ New Category</Button>
      </div>
      <DataTable columns={columns} data={categories} loading={loading} />
    </div>
  );
};
