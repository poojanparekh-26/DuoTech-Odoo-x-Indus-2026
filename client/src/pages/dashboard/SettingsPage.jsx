// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../../hooks/useSessions';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { openSession, loading } = useSessions();
  const [configs, setConfigs] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get('/pos-config').then(res => setConfigs(res.data.data)).catch(console.error);
  }, []);

  const handleOpenSession = async (posId) => {
    const session = await openSession({ posId, openingCash: 1000 });
    if (session && session.id) {
      localStorage.setItem('sessionId', session.id);
    }
    navigate(`/pos/${posId}/floor`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Point of Sale Configurations</h1>
        <Button onClick={() => setModalOpen(true)} className="shadow-lg">+ New POS</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map(c => (
          <div key={c.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">{c.name}</h3>
              <div className="relative group/menu">
                <button className="text-gray-400 hover:text-white p-1">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </button>
                <div className="hidden group-hover/menu:block absolute right-0 top-6 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Settings</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-amber-500 hover:bg-gray-800 transition-colors" onClick={() => window.open('/kitchen', '_blank')}>Kitchen Display</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800 transition-colors" onClick={() => window.open('/customer-display', '_blank')}>Customer Display</button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Open</span>
                <span className="text-gray-300">{c.last_open}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Sell</span>
                <span className="text-amber-400 font-bold">${c.last_sell}</span>
              </div>
            </div>
            
            <Button 
              className="w-full font-bold h-12" 
              loading={loading} 
              onClick={() => handleOpenSession(c.id)}
            >
              Open Session
            </Button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New POS Configuration">
        <div className="space-y-4">
          <Input label="POS Name" placeholder="e.g. Bar Register" />
          
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
             <h4 className="text-white font-medium mb-2">Payment Methods</h4>
             <label className="flex items-center gap-3 text-gray-300">
               <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-700 focus:ring-amber-500 text-amber-600" />
               Cash
             </label>
             <label className="flex items-center gap-3 text-gray-300">
               <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-700 focus:ring-amber-500 text-amber-600" />
               Digital (Card/Bank)
             </label>
             <label className="flex items-center gap-3 text-gray-300">
               <input type="checkbox" className="rounded border-gray-600 bg-gray-700 focus:ring-amber-500 text-amber-600" />
               UPI
             </label>
             <Input label="UPI ID (optional)" placeholder="merchant@upi" />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button>Create Config</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
