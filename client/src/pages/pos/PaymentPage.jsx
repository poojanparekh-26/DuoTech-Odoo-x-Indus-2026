// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/pos/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentMethodButton } from '../../components/pos/PaymentMethodButton';
import { UPIQRModal } from '../../components/pos/UPIQRModal';
import { PaymentConfirmation } from '../../components/pos/PaymentConfirmation';
import { Button } from '../../components/ui/Button';
import { useOrders } from '../../hooks/useOrders';
import { usePayment } from '../../hooks/usePayment';

export const PaymentPage = () => {
  const { configId, orderId } = useParams();
  const navigate = useNavigate();
  
  const { getOrder, updateOrder } = useOrders();
  const { createPayment, fetchMethods } = usePayment();
  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    if (orderId && !orderId.startsWith('mock')) {
      getOrder(orderId).then(setOrder).catch(console.error);
    }
    fetchMethods().then(setMethods).catch(console.error);
  }, [orderId, fetchMethods, getOrder]);

  const total = order ? Number(order.total) : 0;
  
  const [payments, setPayments] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [numpadValue, setNumpadValue] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Removed hardcoded methods

  const handleNumpad = (num) => setNumpadValue(prev => prev + num);
  const handleClear = () => setNumpadValue("");

  const handleSelectMethod = (m) => {
    setSelectedMethod(m);
    if (m.type === 'UPI') {
      setShowQR(true);
    } else {
      // For Cash and Card, add payment immediately
      const amountToAdd = numpadValue ? Number(numpadValue) : (total - totalPaid);
      if (amountToAdd > 0) {
        setPayments([...payments, { method: m, amount: amountToAdd }]);
        setNumpadValue("");
        setSelectedMethod(null);
      }
    }
  };

  const handleConfirmUPI = () => {
    setShowQR(false);
    const amountToAdd = numpadValue ? Number(numpadValue) : (total - totalPaid);
    setPayments([...payments, { method: selectedMethod, amount: amountToAdd }]);
    setNumpadValue("");
    setSelectedMethod(null);
  };

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleValidate = async () => {
    if (totalPaid >= total && order) {
      try {
        const sessionId = localStorage.getItem('sessionId');
        for (const p of payments) {
          await createPayment({ 
            orderId: order.id, 
            amount: p.amount, 
            paymentMethodId: p.method.id,
            sessionId
          });
        }
        await updateOrder(order.id, { status: 'PAID' });
        setShowConfirmation(true);
      } catch (err) {
        console.error(err);
      }
    } else if (totalPaid >= total && orderId.startsWith('mock')) {
      setShowConfirmation(true);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      
      {/* LEFT : PAYMENT OPS */}
      <div className="w-[60%] flex flex-col p-8 border-r border-gray-800 max-h-screen overflow-y-auto">
         <h1 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">Complete Payment</h1>
         
         <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700 flex justify-between items-center shadow-lg">
            <span className="text-2xl text-gray-400 font-medium tracking-wide">Total Due</span>
            <span className="text-6xl font-black text-green-500 tabular-nums">${Number(Math.max(0, total - totalPaid)).toFixed(2)}</span>
         </div>

         <div className="grid grid-cols-2 gap-8 flex-1">
            <div className="space-y-4">
              <h3 className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-6">Payment Methods</h3>
              {methods.map(m => (
                <PaymentMethodButton 
                  key={m.id} 
                  method={m} 
                  isSelected={selectedMethod?.id === m.id || payments.some(p => p.method.id === m.id)}
                  amount={payments.find(p => p.method.id === m.id)?.amount}
                  onSelect={handleSelectMethod}
                  onRemove={(id) => setPayments(payments.filter(p => p.method.id !== id))}
                />
              ))}
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col shadow-lg">
              <div className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg mb-6 flex items-center justify-end px-6 text-4xl text-white font-mono shadow-inner tracking-widest tabular-nums">
                {numpadValue || '0.00'}
              </div>
              <div className="grid grid-cols-3 gap-3 flex-1">
                {['1','2','3','4','5','6','7','8','9'].map(n => (
                  <button key={n} onClick={() => handleNumpad(n)} className="bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg transition-colors shadow-sm">{n}</button>
                ))}
                <button onClick={handleClear} className="bg-red-700/80 hover:bg-red-600 text-white font-bold rounded-lg text-2xl shadow-sm">C</button>
                <button onClick={() => handleNumpad('0')} className="bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg shadow-sm">0</button>
                <button onClick={() => handleNumpad('.')} className="bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg shadow-sm">.</button>
              </div>
            </div>
         </div>
      </div>

      {/* RIGHT : SLIP & VALIDATE */}
      <div className="w-[40%] flex flex-col p-8 bg-gray-800 border-l border-gray-700 shadow-xl max-h-screen">
         <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-xl font-bold text-gray-300">Order Summary</h2>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white font-medium bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">Cancel</button>
         </div>

         <div className="flex-1 bg-[#fefefe] p-8 rounded-lg shadow-inner font-mono text-gray-800 flex flex-col overflow-y-auto w-full max-w-[400px] mx-auto border border-gray-300 transform scale-[0.98] transition-transform">
            <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
               <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">Odoo Cafe</h3>
               <p className="text-sm text-gray-500 mb-1">123 Street Name, City</p>
               <p className="text-base text-gray-700 font-bold mt-4">Order {order?.order_number || orderId}</p>
            </div>
            
            <div className="flex-1 space-y-3">
               {order?.items?.map(it => (
                 <div key={it.id} className="flex justify-between text-base mb-1">
                   <span>{it.quantity}x {it.name}</span>
                   <span>${Number(it.subtotal).toFixed(2)}</span>
                 </div>
               ))}
               {!order && (
                 <div className="text-center text-gray-400 italic">No items found</div>
               )}
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300 space-y-2">
               <div className="flex justify-between text-gray-600">
                 <span>Subtotal</span>
                 <span>${order ? Number(order.subtotal).toFixed(2) : '0.00'}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                 <span>Tax</span>
                 <span>${order ? Number(order.tax_amount).toFixed(2) : '0.00'}</span>
               </div>
               <div className="flex justify-between font-bold text-2xl mt-4 bg-gray-100 p-2 rounded">
                 <span>TOTAL</span>
                 <span>${total.toFixed(2)}</span>
               </div>
            </div>
         </div>

         <div className="mt-8 space-y-6 shrink-0 max-w-[400px] mx-auto w-full">
            <label className="flex items-center justify-center gap-3 text-gray-300 p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-800 focus:ring-amber-500 text-amber-500 cursor-pointer" />
              <span className="font-medium text-lg">Generate Print Invoice</span>
            </label>
            <Button 
               className="w-full h-20 text-3xl font-bold tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]" 
               disabled={totalPaid < total}
               onClick={handleValidate}
            >
               {totalPaid >= total ? 'Validate' : 'Awaiting Payment'}
            </Button>
         </div>
      </div>

      <UPIQRModal 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
        onConfirm={handleConfirmUPI}
        amount={total}
        qrDataUrl="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=merchant@upi&pn=OdooCafe"
      />

      <PaymentConfirmation 
        isVisible={showConfirmation} 
        amountPaid={totalPaid} 
        onContinue={() => navigate(`/pos/${configId}/floor`)}
      />
    </div>
  );
};
