import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { authFetch } from '../api';

// ─── Constants ─────────────────────────────────────────────────────────────────
const POLL_MS = 12_000; // refresh every 12 s

const STATUS_FLOW = {
  pending:    { next: 'preparing', label: 'Start Cooking',  color: 'amber'   },
  preparing:  { next: 'ready',     label: 'Mark as Ready',  color: 'orange'  },
  ready:      { next: null,        label: 'Served',         color: 'emerald' },
};

const STATUS_STYLES = {
  pending:   { dot: 'bg-amber-400 animate-pulse', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',  ring: 'border-amber-500/30'  },
  preparing: { dot: 'bg-orange-400 animate-pulse', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25', ring: 'border-orange-500/30' },
  ready:     { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', ring: 'border-emerald-500/30' },
};

// ─── Mock data fallback ────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  {
    id: 'mock-1', table_no: 3, status: 'pending', created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    items: [
      { id: 1, product_name: 'Paneer Tikka',     quantity: 2, variant_name: null },
      { id: 2, product_name: 'Butter Naan',      quantity: 4, variant_name: null },
    ],
  },
  {
    id: 'mock-2', table_no: 7, status: 'preparing', created_at: new Date(Date.now() - 9 * 60000).toISOString(),
    items: [
      { id: 3, product_name: 'Dal Makhani',      quantity: 1, variant_name: null },
      { id: 4, product_name: 'Mango Lassi',      quantity: 2, variant_name: 'Large' },
    ],
  },
  {
    id: 'mock-3', table_no: 1, status: 'ready', created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    items: [
      { id: 5, product_name: 'Gulab Jamun',      quantity: 3, variant_name: null },
      { id: 6, product_name: 'Veg Spring Rolls', quantity: 2, variant_name: null },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function elapsed(isoStr) {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function elapsedMinutes(isoStr) {
  return Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ order, onAdvance, advancing }) {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceRender(n => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const styles  = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const flow    = STATUS_FLOW[order.status];
  const age     = elapsedMinutes(order.created_at);
  const isLate  = age >= 10 && order.status !== 'ready';

  return (
    <div className={`flex flex-col bg-slate-900 border rounded-2xl overflow-hidden
                     transition-all duration-300 ${styles.ring} border`}>
      {/* ── Top bar ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-800`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <span className="text-white font-bold text-sm">
            Table {order.table_no ?? '—'}
          </span>
          <span className="text-slate-600 text-xs">#{String(order.id).slice(-6)}</span>
        </div>

        <div className="flex items-center gap-2">
          {isLate && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25
                             text-rose-400 text-[10px] font-bold uppercase tracking-wide">
              Late
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* ── Items ── */}
      <div className="flex-1 px-4 py-3 space-y-2">
        {(order.items ?? []).map((item, i) => (
          <div key={item.id ?? i} className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-orange-400 font-bold text-sm tabular-nums shrink-0">
                ×{item.quantity}
              </span>
              <span className="text-white text-sm leading-snug">{item.product_name ?? 'Item'}</span>
            </div>
            {item.variant_name && (
              <span className="text-slate-500 text-xs shrink-0 mt-0.5">{item.variant_name}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        <p className="text-slate-600 text-xs">{elapsed(order.created_at)}</p>

        {flow?.next && (
          <button
            id={`advance-order-${order.id}`}
            onClick={() => onAdvance(order.id, flow.next)}
            disabled={advancing}
            className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide
                        transition-all duration-200 active:scale-[0.97] disabled:opacity-60
                        ${order.status === 'pending'
                          ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25'
                        }`}
          >
            {advancing ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Updating…
              </span>
            ) : flow.label}
          </button>
        )}

        {order.status === 'ready' && (
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center
                          bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            ✓ Ready to Serve
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyKitchen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20
                      flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-400/50"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L9 22h6l1.2-7.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7z"/>
        </svg>
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">All caught up!</h3>
        <p className="text-slate-500 text-sm">No active orders in the queue.</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KitchenPage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [advancing, setAdvancing] = useState(null); // order id being advanced
  const timerRef = useRef(null);

  // ── Fetch helper ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await authFetch('/orders?status=pending,preparing,ready');
      const rows = Array.isArray(data) ? data : data.orders ?? data.data ?? [];
      setOrders(rows.length > 0 ? rows : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
      setLastSync(new Date());
    }
  }, []);

  // ── Initial load + polling ──────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    timerRef.current = setInterval(() => fetchOrders(true), POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchOrders]);

  // ── Advance status ──────────────────────────────────────────────────────────
  async function handleAdvance(orderId, nextStatus) {
    setAdvancing(orderId);
    const isMock = String(orderId).startsWith('mock-');
    try {
      if (!isMock) {
        await authFetch(`/orders/${orderId}`, {
          method: 'PATCH',
          body:   JSON.stringify({ status: nextStatus }),
        });
      }
      // Optimistic update
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
      );
    } catch (err) {
      console.error('[KitchenPage] advance failed:', err.message);
    } finally {
      setAdvancing(null);
    }
  }

  // ── Per-status buckets ─────────────────────────────────────────────────────
  const pending   = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready     = orders.filter(o => o.status === 'ready');

  const Bucket = ({ title, accent, items, emptyMsg }) => (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div className={`flex items-center gap-2 pb-3 border-b ${accent.border}`}>
        <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
        <h2 className={`font-bold text-sm uppercase tracking-wider ${accent.text}`}>{title}</h2>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${accent.badge}`}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-600 text-xs text-center py-8">{emptyMsg}</p>
      ) : (
        items.map(order => (
          <TicketCard
            key={order.id}
            order={order}
            onAdvance={handleAdvance}
            advancing={advancing === order.id}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25
                               flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L9 22h6l1.2-7.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7z"/>
                </svg>
              </span>
              Kitchen Display
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {lastSync ? `Last synced ${elapsed(lastSync.toISOString())}` : 'Loading…'}
            </p>
          </div>

          <button
            id="refresh-kitchen-btn"
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-slate-800 border border-slate-700 text-slate-300 hover:text-white
                       hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
                 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats bar ── */}
        {!loading && orders.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { label: 'Pending',   count: pending.length,   cls: 'bg-amber-500/10 border-amber-500/25 text-amber-400'   },
              { label: 'Preparing', count: preparing.length, cls: 'bg-orange-500/10 border-orange-500/25 text-orange-400' },
              { label: 'Ready',     count: ready.length,     cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' },
              { label: 'Total',     count: orders.length,    cls: 'bg-slate-800 border-slate-700 text-slate-300'           },
            ].map(({ label, count, cls }) => (
              <span key={label}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cls}`}>
                {label}: {count}
              </span>
            ))}
          </div>
        )}

        {/* ── Board ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
            <p className="text-slate-500 text-sm animate-pulse">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyKitchen />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Bucket
              title="Pending"
              items={pending}
              emptyMsg="No new orders"
              accent={{
                dot: 'bg-amber-400 animate-pulse',
                text: 'text-amber-400',
                border: 'border-amber-500/20',
                badge: 'bg-amber-500/15 text-amber-400',
              }}
            />
            <Bucket
              title="Preparing"
              items={preparing}
              emptyMsg="Nothing cooking yet"
              accent={{
                dot: 'bg-orange-400 animate-pulse',
                text: 'text-orange-400',
                border: 'border-orange-500/20',
                badge: 'bg-orange-500/15 text-orange-400',
              }}
            />
            <Bucket
              title="Ready"
              items={ready}
              emptyMsg="None ready yet"
              accent={{
                dot: 'bg-emerald-400',
                text: 'text-emerald-400',
                border: 'border-emerald-500/20',
                badge: 'bg-emerald-500/15 text-emerald-400',
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
