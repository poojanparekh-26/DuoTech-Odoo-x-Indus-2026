// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/NumberPad.jsx
import React from 'react';

export const NumberPad = ({ value = '', onChange, mode = 'qty', onModeChange }) => {
  const handleNumClick = (num) => {
    onChange(value + num);
  };
  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };
  const handleClear = () => {
    onChange('');
  };

  const btnClass = "h-14 bg-gray-700 hover:bg-gray-600 text-white font-medium text-lg rounded shadow-sm transition-colors active:bg-gray-500";
  const modeBtnClass = (active) => 
    `h-12 text-sm font-medium rounded transition-colors ${active ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`;

  return (
    <div className="flex flex-col gap-2 bg-gray-900 p-4 rounded-xl border border-gray-800 shrink-0">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button className={modeBtnClass(mode === 'qty')} onClick={() => onModeChange('qty')}>Qty</button>
        <button className={modeBtnClass(mode === 'discount')} onClick={() => onModeChange('discount')}>Disc</button>
        <button className={modeBtnClass(mode === 'price')} onClick={() => onModeChange('price')}>Price</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1','2','3','4','5','6','7','8','9','+/-','0','.'].map(num => (
          <button key={num} className={btnClass} onClick={() => handleNumClick(num)}>{num}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-0">
        <button className="h-14 bg-red-700/80 hover:bg-red-600 text-white font-medium text-lg rounded shadow-sm transition-colors" onClick={handleClear}>Clear</button>
        <button className="h-14 bg-gray-600 hover:bg-gray-500 text-white font-medium text-lg rounded shadow-sm transition-colors flex items-center justify-center auto" onClick={handleBackspace}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg>
        </button>
      </div>
    </div>
  );
};
