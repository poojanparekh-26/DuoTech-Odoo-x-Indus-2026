// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/PaymentConfirmation.jsx
import React from 'react';

export const PaymentConfirmation = ({ isVisible, amountPaid, onContinue }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm cursor-pointer"
      onClick={onContinue}
    >
      <div className="flex flex-col items-center animate-bounce-short">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Payment Successful</h2>
        <p className="text-gray-400 text-lg mb-8">Amount Paid: <span className="text-amber-500 font-bold">${Number(amountPaid).toFixed(2)}</span></p>
        <p className="text-gray-500 text-sm animate-pulse">Click anywhere to continue</p>
      </div>
    </div>
  );
};
