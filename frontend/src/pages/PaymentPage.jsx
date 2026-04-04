import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authFetch } from '../api';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toFixed(2)}`;

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <p className="text-slate-500 text-sm animate-pulse">{label}</p>
    </div>
  );
}

// ─── Payment method button ─────────────────────────────────────────────────────
function PayMethodBtn({ id, label, icon, active, onClick }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border text-sm font-semibold
                  transition-all duration-200 active:scale-95
                  ${active
                    ? 'bg-violet-500/15 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Success Overlay ──────────────────────────────────────────────────────────
function SuccessOverlay({ orderId, total, method, onDone }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center
                      shadow-2xl shadow-emerald-500/10 animate-[fadeInUp_0.25s_ease-out]">
        {/* Checkmark */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30
                        flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-400"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Payment Received!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Order #{orderId} · {method}
        </p>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-400 tabular-nums">{fmt(total)}</p>
        </div>

        <button
          id="done-payment-btn"
          onClick={onDone}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400
                     text-white text-sm font-semibold transition-all duration-200
                     shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 active:scale-95"
        >
          Back to Tables
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const orderId        = searchParams.get('orderId');

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [payMethod,  setPayMethod]  = useState('cash'); // 'cash' | 'card' | 'upi'
  const [paying,     setPaying]     = useState(false);
  const [paid,       setPaid]       = useState(false);
  const [payError,   setPayError]   = useState('');

  // ── Fetch order details ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    // Mock orders are identified by the "mock-" prefix
    const isMock = String(orderId).startsWith('mock-');

    (async () => {
      try {
        if (isMock) throw new Error('mock');
        const data = await authFetch(`/orders/${orderId}`);
        // Normalise: backend may return { order } or the object directly
        setOrder(data?.order ?? data);
      } catch {
        // Graceful fallback — synthesise a plausible order for display
        setOrder({
          id:           orderId,
          status:       'confirmed',
          total_amount: 0,
          items: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // ── Mark as paid ─────────────────────────────────────────────────────────────
  async function handlePay() {
    if (paying || paid) return;
    setPaying(true);
    setPayError('');

    const isMock = String(orderId).startsWith('mock-');

    try {
      if (!isMock) {
        await authFetch(`/orders/${orderId}`, {
          method: 'PATCH',
          body:   JSON.stringify({ status: 'paid', payment_method: payMethod }),
        });
      }
      setPaid(true);
    } catch (err) {
      setPayError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  const total      = Number(order?.total_amount ?? 0);
  const items      = Array.isArray(order?.items) ? order.items : [];
  const isMockOrder = String(orderId).startsWith('mock-');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            id="back-from-payment-btn"
            onClick={() => navigate('/tables')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400
                       hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700
                       transition-all duration-200 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Tables
          </button>

          <div className="h-6 w-px bg-slate-700" />

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Payment</h1>
            {orderId && (
              <p className="text-slate-500 text-sm mt-0.5">
                Order #{orderId}{isMockOrder && ' (demo)'}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading order…" />
        ) : !orderId ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No order ID found.</p>
            <button
              className="text-orange-400 hover:underline text-sm"
              onClick={() => navigate('/')}
            >
              Go back to Floors
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── Order summary card ── */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-400"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <h2 className="text-white font-semibold text-sm">Order Summary</h2>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-slate-500 text-sm">
                    {isMockOrder
                      ? 'Item details are not available for demo orders.'
                      : 'No item details available.'}
                  </p>
                </div>
              ) : (
                <div>
                  {items.map((item, i) => {
                    const lineTotal = Number(item.unit_price ?? item.unitPrice ?? 0)
                                    * Number(item.quantity ?? item.qty ?? 1);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-5 py-3 border-b border-slate-800 last:border-0"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {item.product_name ?? item.name ?? `Item ${i + 1}`}
                          </p>
                          {item.variant_name && (
                            <p className="text-slate-500 text-xs mt-0.5">{item.variant_name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-orange-400 font-semibold text-sm tabular-nums">
                            {fmt(lineTotal)}
                          </p>
                          <p className="text-slate-600 text-xs tabular-nums">
                            {fmt(item.unit_price ?? item.unitPrice ?? 0)} × {item.quantity ?? item.qty ?? 1}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total row */}
              <div className="flex items-center justify-between px-5 py-4 bg-slate-800/40 border-t border-slate-700">
                <span className="text-slate-400 text-sm font-medium">Total</span>
                <span className="text-white font-bold text-xl tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            {/* ── Payment method ── */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5">
              <p className="text-slate-300 text-sm font-semibold mb-3">Payment Method</p>
              <div className="flex gap-3">
                <PayMethodBtn
                  id="pay-method-cash"
                  label="Cash"
                  active={payMethod === 'cash'}
                  onClick={() => setPayMethod('cash')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="2"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                />
                <PayMethodBtn
                  id="pay-method-card"
                  label="Card"
                  active={payMethod === 'card'}
                  onClick={() => setPayMethod('card')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  }
                />
                <PayMethodBtn
                  id="pay-method-upi"
                  label="UPI"
                  active={payMethod === 'upi'}
                  onClick={() => setPayMethod('upi')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  }
                />
              </div>
            </div>

            {/* ── Error banner ── */}
            {payError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10
                              border border-rose-500/25 text-rose-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {payError}
              </div>
            )}

            {/* ── Confirm payment button ── */}
            <button
              id="confirm-payment-btn"
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                         bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-bold text-base transition-all duration-200
                         shadow-xl shadow-violet-500/25 hover:shadow-violet-400/35 active:scale-[0.98]"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Confirm Payment · {fmt(total)}
                </>
              )}
            </button>

          </div>
        )}
      </main>

      {/* ── Success overlay ── */}
      {paid && (
        <SuccessOverlay
          orderId={orderId}
          total={total}
          method={payMethod.charAt(0).toUpperCase() + payMethod.slice(1)}
          onDone={() => navigate('/tables')}
        />
      )}
    </div>
  );
}
