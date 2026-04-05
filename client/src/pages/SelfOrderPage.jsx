// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/SelfOrderPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';

export const SelfOrderPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      if (token === 'invalid') setError(true);
      else {
        setProducts([
          { id: '1', name: 'Espresso', price: 3.50, category: 'Coffee' },
          { id: '2', name: 'Latte', price: 4.50, category: 'Coffee' },
          { id: '3', name: 'Croissant', price: 3.00, category: 'Pastry' },
          { id: '4', name: 'Muffin', price: 2.50, category: 'Pastry' }
        ]);
      }
      setLoading(false);
    }, 800);
  }, [token]);

  const addToCart = (p) => {
    const existing = cart.find(i => i.id === p.id);
    if (existing) setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    else setCart([...cart, { ...p, qty: 1 }]);
  };

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const itemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const placeOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrderPlaced(true);
    }, 1000);
  };

  if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-red-500 text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-white mb-2">Invalid Session</h1>
      <p className="text-gray-400">This QR code is invalid or has expired.</p>
    </div>
  );

  if (orderPlaced) return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Order Placed!</h1>
      <p className="text-gray-400 mb-8 max-w-xs mx-auto">Your order has been sent to the kitchen and is being prepared.</p>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl py-6 px-10 mb-8 shadow-lg">
        <span className="text-gray-400 text-xs uppercase tracking-widest block mb-2 font-medium">Order Number</span>
        <span className="text-amber-500 text-5xl font-bold font-mono tracking-wider">1092</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col pb-24 font-sans relative w-full max-w-md mx-auto shadow-2xl overflow-hidden">
       <header className="bg-gray-800 p-4 sticky top-0 z-10 border-b border-gray-700 shadow-sm flex items-center justify-between">
         <h1 className="text-xl font-bold text-white tracking-wide">Table 4 <span className="text-amber-500 font-medium ml-2 text-sm uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">Self Order</span></h1>
       </header>

       <div className="flex overflow-x-auto gap-3 p-4 scrollbar-hide bg-gray-900 shrink-0 border-b border-gray-800">
          <button className="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap bg-amber-600 text-white shadow-md">All Menu</button>
          <button className="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition">Coffee</button>
          <button className="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition">Pastry</button>
       </div>

       <div className="flex-1 p-5 grid grid-cols-2 gap-4 auto-rows-max overflow-y-auto">
         {products.map(p => (
           <div key={p.id} className="bg-gray-800 rounded-2xl border border-gray-700 p-5 flex flex-col justify-between active:scale-[0.96] transition-transform shadow-sm">
             <div className="mb-4">
               <h3 className="text-gray-100 font-bold text-lg line-clamp-2 leading-tight mb-2">{p.name}</h3>
               <span className="text-amber-500 font-bold">${p.price.toFixed(2)}</span>
             </div>
             <button onClick={() => addToCart(p)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-gray-600">
               + Add
             </button>
           </div>
         ))}
       </div>

       {cart.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-amber-600/30 p-5 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] animate-slide-up rounded-t-2xl">
           <div className="flex justify-between items-center">
             <div className="flex flex-col">
               <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 px-2 py-0.5 bg-gray-900 rounded inline-block w-max">{itemCount} items</span>
               <span className="text-white font-black text-3xl tabular-nums">${total.toFixed(2)}</span>
             </div>
             <button onClick={placeOrder} className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
               Place Order
             </button>
           </div>
         </div>
       )}
    </div>
  );
};
