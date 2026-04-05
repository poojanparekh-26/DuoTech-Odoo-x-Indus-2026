import { useLocation, useNavigate } from 'react-router-dom';

const fmt = (n) => `₹${Number(n).toFixed(0)}`;

export default function CustomerSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">No order found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { orderId, items, total, demo } = state;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">
        
        {/* ── Success Card ── */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg shadow-teal-500/10 mb-6 border border-teal-100 animate-[fadeInUp_0.4s_ease-out]">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your order has been sent to the kitchen.
            {demo && <span className="block mt-1 text-orange-500 font-medium">(Demo Mode)</span>}
          </p>

          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Order Number</p>
            <p className="text-gray-900 font-bold text-xl tabular-nums">#{String(orderId).slice(-6)}</p>
          </div>
        </div>

        {/* ── Receipt Card ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h2 className="text-gray-800 font-semibold text-sm">Receipt Summary</h2>
          </div>

          <div className="p-6 space-y-4">
            {items && items.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <p className="text-gray-800 font-medium">{item.name || `Item ${item.product_id}`}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.quantity} × {fmt(item.unit_price)}</p>
                </div>
                <p className="text-gray-900 font-semibold tabular-nums">{fmt(item.quantity * item.unit_price)}</p>
              </div>
            ))}

            <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex items-center justify-between">
              <span className="text-gray-500 font-medium text-sm">Total Amount</span>
              <span className="text-teal-600 font-extrabold text-lg tabular-nums">{fmt(total)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 text-gray-500 font-semibold text-sm hover:text-gray-800 transition-colors"
        >
          Start a new order
        </button>

      </div>
    </div>
  );
}
