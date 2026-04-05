// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/pos/FloorViewPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFloors } from '../../hooks/useFloors';
import { TableCard } from '../../components/pos/TableCard';
import { Spinner } from '../../components/ui/Spinner';

export const FloorViewPage = () => {
  const navigate = useNavigate();
  const { configId } = useParams();
  const { fetchFloors, loading } = useFloors();
  const [floors, setFloors] = useState([]);
  const [activeFloor, setActiveFloor] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchFloors(configId).then(f => f && setFloors(f));
  }, [fetchFloors, configId]);

  if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center"><Spinner size="lg" /></div>;

  const currentFloor = floors[activeFloor];

  return (
    <div className="h-screen bg-gray-900 flex flex-col font-sans transition-all">
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-20">
        <div className="flex bg-gray-900 rounded-lg p-1">
          <button className="px-6 py-2 text-sm font-bold rounded-md bg-amber-600 text-white shadow">Table</button>
          <button className="px-6 py-2 text-sm font-bold rounded-md text-gray-400 hover:text-white transition-colors" onClick={() => navigate(`/pos/${configId}/order/takeaway`)}>Register</button>
          <button className="px-6 py-2 text-sm font-bold rounded-md text-gray-400 hover:text-white transition-colors" onClick={() => navigate('/dashboard/orders')}>Orders</button>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-gray-900 rounded-lg p-1 overflow-x-auto max-w-[400px]">
             {floors.map((f, idx) => (
                <button 
                  key={f.id} 
                  onClick={() => setActiveFloor(idx)}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap rounded-md transition-colors ${activeFloor === idx ? 'bg-gray-700 text-white border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}
                >
                  {f.name}
                </button>
             ))}
          </div>

          <div className="relative border-l border-gray-700 pl-4">
            <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2">
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700" onClick={() => window.location.reload()}>Reload Data</button>
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Go to Back-end</button>
                <div className="h-px bg-gray-700 my-2"></div>
                <button className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 font-bold" onClick={() => navigate('/dashboard')}>Close Register</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
        <h2 className="text-2xl font-bold text-gray-500 mb-8 opacity-50 uppercase tracking-widest">{currentFloor?.name || 'Floor View'}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {currentFloor?.tables?.map(table => (
            <TableCard 
              key={table.id}
              table={table}
              hasOrder={Math.random() > 0.7} 
              orderTotal={Math.random() > 0.7 ? 45.50 : 0}
              onClick={() => navigate(`/pos/${configId}/order/${table.id}`)}
            />
          ))}
          
          {(!currentFloor?.tables || currentFloor.tables.length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-600 bg-gray-800/50 rounded-xl border border-gray-800 border-dashed">
              No tables configured for this floor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
