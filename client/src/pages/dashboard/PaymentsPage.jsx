// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/PaymentsPage.jsx
import React, { useEffect, useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { Spinner } from '../../components/ui/Spinner';

export const PaymentsPage = () => {
  const { fetchPayments, loading } = usePayment();
  const [payments, setPayments] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPayments().then(p => {
      setPayments(Array.isArray(p) ? p : []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Group payments by method type
  const groupedPayments = { CASH: [], DIGITAL: [], UPI: [] };
  payments.forEach(p => {
    const type = p.type || p.payment_type || 'CASH';
    if (groupedPayments[type]) groupedPayments[type].push(p);
    else groupedPayments['CASH'].push(p);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Payments Registry</h1>
      
      {!loaded ? (
        <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {['CASH', 'DIGITAL', 'UPI'].map(method => {
            const methodPayments = groupedPayments[method];
            const total = methodPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
            return (
              <div key={method} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xl shrink-0">
                      {method === 'CASH' ? '💵' : method === 'UPI' ? '📱' : '💳'}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{method}</h3>
                  </div>
                  <span className="text-lg font-bold text-amber-500">₹{total.toFixed(2)}</span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-800 border-b border-gray-700 text-gray-500 hidden sm:table-header-group">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Reference</th>
                        <th className="px-6 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {methodPayments.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No payments recorded</td>
                        </tr>
                      ) : (
                        methodPayments.map(p => (
                          <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="px-6 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-3 font-mono text-xs">{p.order_id?.slice(0, 8) || '—'}</td>
                            <td className="px-6 py-3 text-right text-amber-400 font-semibold">₹{Number(p.amount).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
