// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/FloorsPage.jsx
import React, { useEffect, useState } from 'react';
import { useFloors } from '../../hooks/useFloors';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';

export const FloorsPage = () => {
  const { fetchFloors, fetchFloor, loading } = useFloors();
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    fetchFloors().then((floorList) => {
      if (floorList) setFloors(floorList);
    });
  }, [fetchFloors]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Floors & Tables</h1>
        <Button variant="primary" className="shadow-md">+ New Floor</Button>
      </div>

      <div className="space-y-8">
        {floors.map(floor => (
          <div key={floor.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex flex-col sm:flex-row gap-4 items-end">
              <Input label="Floor Name" defaultValue={floor.name} className="max-w-xs" />
              <div className="flex flex-col w-full max-w-xs mb-[2px]">
                <label className="mb-1 text-sm font-medium text-gray-300">Linked POS</label>
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-amber-500">
                  <option>Main Register</option>
                  <option>Bar Register</option>
                </select>
              </div>
              <Button variant="secondary" className="mb-[2px]">Save Details</Button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Table Configuration</h3>
                <Button variant="ghost" size="sm">+ Add Table</Button>
              </div>
              
              <DataTable 
                columns={[
                  { key: 'table_number', label: 'Table No.', render: (r) => <span className="font-bold text-amber-500">#{r.table_number}</span> },
                  { key: 'seats', label: 'Seats Capacity' },
                  { key: 'is_active', label: 'Status', render: () => <span className="text-green-500 text-sm">Active</span> },
                  { key: 'actions', label: '', render: () => <button className="text-red-500 hover:text-red-400 text-sm">Remove</button> }
                ]} 
                data={floor.tables} 
              />
            </div>
          </div>
        ))}

        {!loading && floors.length === 0 && (
          <div className="p-12 bg-gray-800 border border-dashed border-gray-600 rounded-xl text-center">
             <p className="text-gray-400">No floors layout configured.</p>
          </div>
        )}
      </div>
    </div>
  );
};
