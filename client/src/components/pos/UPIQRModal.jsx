// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/pos/UPIQRModal.jsx
import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const UPIQRModal = ({ isOpen, onClose, onConfirm, qrDataUrl, amount, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="UPI Payment QR" size="sm">
      <div className="flex flex-col items-center justify-center py-4">
        <h3 className="text-2xl font-bold text-white mb-6">Amount: <span className="text-amber-500">${amount}</span></h3>
        
        {qrDataUrl ? (
          <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
            <img src={qrDataUrl} alt="UPI QR Code" className="w-48 h-48 object-contain" />
          </div>
        ) : (
          <div className="w-48 h-48 bg-gray-700 rounded-xl mb-8 flex items-center justify-center animate-pulse">
            <span className="text-gray-500 text-sm">Generating QR...</span>
          </div>
        )}

        <div className="flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1 !bg-green-600 hover:!bg-green-500" onClick={onConfirm} loading={loading}>
            Confirmed
          </Button>
        </div>
      </div>
    </Modal>
  );
};
