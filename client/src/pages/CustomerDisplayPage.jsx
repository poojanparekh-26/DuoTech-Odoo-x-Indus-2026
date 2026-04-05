// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/CustomerDisplayPage.jsx
import React, { useState, useEffect } from 'react';

export const CustomerDisplayPage = () => {
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    // Mock incoming order after 5s
    const timer1 = setTimeout(() => {
       setCurrentOrder({
         status: 'DRAFT',
         total: 45.00,
         items: [{ name: 'Espresso', qty: 2, price: 6.00 }, { name: 'Cheesecake', qty: 1, price: 39.00 }]
       });
    }, 3000);

    const timer2 = setTimeout(() => {
       setCurrentOrder(prev => prev ? { ...prev, status: 'PAID' } : null);
    }, 12000);

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  useEffect(() => {
    if (currentOrder?.status === 'PAID') {
      const timer = setTimeout(() => setCurrentOrder(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentOrder?.status]);

  if (currentOrder?.status === 'PAID') {
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mb-8 border-4 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">Thank You!</h1>
        <p className="text-2xl text-gray-400 mb-8">Payment of <span className="text-white font-bold">${currentOrder.total.toFixed(2)}</span> received successfully.</p>
        <p className="text-amber-500 animate-pulse text-lg tracking-widest font-mono">Please take your receipt.</p>
      </div>
    );
  }

  if (currentOrder && currentOrder.status !== 'PAID') {
    return (
      <div className="h-screen bg-gray-900 flex flex-col p-12">
        <div className="text-center mb-12 shrink-0">
           <h1 className="text-5xl font-bold text-amber-500 mb-4 font-serif italic drop-shadow-md">Odoo Cafe</h1>
           <div className="h-1 w-32 bg-gray-700 mx-auto rounded-full"></div>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-hidden">
          <div className="flex justify-between items-end mb-6 shrink-0">
             <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Your Order</h2>
             <span className="text-amber-500 animate-pulse text-xl font-medium tracking-wider">Order in progress...</span>
          </div>
          
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl flex-1 flex flex-col">
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-2xl text-gray-300">
                <thead className="bg-gray-900/80 border-b border-gray-700 shadow-sm">
                  <tr>
                    <th className="px-10 py-6 font-medium w-1/2 uppercase tracking-wide text-gray-400">Item</th>
                    <th className="px-10 py-6 text-center font-medium uppercase tracking-wide text-gray-400">Qty</th>
                    <th className="px-10 py-6 text-right font-medium uppercase tracking-wide text-gray-400">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {currentOrder.items.map((item, idx) => (
                    <tr key={idx} className="bg-gray-800/80 hover:bg-gray-800 transition-colors">
                      <td className="px-10 py-8 text-white font-bold">{item.name}</td>
                      <td className="px-10 py-8 text-center text-amber-500 font-bold">{item.qty}x</td>
                      <td className="px-10 py-8 text-right font-mono">${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-10 bg-gray-900/95 border-t-2 border-gray-700 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
               <div className="flex justify-between items-center text-5xl">
                 <span className="text-white font-black tracking-widest">TOTAL DUE</span>
                 <span className="text-green-500 font-black tabular-nums">${currentOrder.total.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IDLE STATE
  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-md"></div>
      <h1 className="text-8xl font-bold text-amber-500 mb-8 font-serif italic tracking-tighter drop-shadow-2xl translate-y-[-2rem]">Odoo Cafe</h1>
      
      <div className="flex items-center gap-4 mb-10 w-96 opacity-50 translate-y-[-1rem]">
        <div className="h-px bg-gray-500 flex-1"></div>
        <span className="text-gray-400 text-xl">✦</span>
        <div className="h-px bg-gray-500 flex-1"></div>
      </div>
      
      <p className="text-5xl text-white font-light tracking-[0.2em] uppercase translate-y-[-1rem]">Welcome!</p>
      
      <div className="fixed bottom-16 flex flex-col items-center gap-4">
        <p className="text-gray-500 animate-pulse font-mono tracking-[0.3em] text-lg">AWAITING ORDER</p>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '0s'}}></div>
           <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '0.2s'}}></div>
           <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};
