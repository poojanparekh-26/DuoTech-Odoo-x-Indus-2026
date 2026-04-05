import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { authFetch } from '../api';

// ─── Mock stats fallback ───────────────────────────────────────────────────────
const MOCK_STATS = {
  today_revenue:    12480,
  today_orders:     34,
  active_tables:    6,
  avg_order_value:  367,
  revenue_change:   12.4,   // % vs yesterday
  orders_change:    8.1,
};

const MOCK_TOP_ITEMS = [
  { name: 'Paneer Tikka',     qty: 48, revenue: 8640 },
  { name: 'Dal Makhani',      qty: 31, revenue: 6820 },
  { name: 'Butter Naan',      qty: 87, revenue: 3480 },
  { name: 'Mango Lassi',      qty: 42, revenue: 3780 },
  { name: 'Gulab Jamun',      qty: 29, revenue: 2320 },
];

const MOCK_RECENT_ORDERS = [
  { id: 'ORD-001', table_no: 3, status: 'paid',      total_amount: 540,  created_at: new Date(Date.now() - 5  * 60000).toISOString() },
  { id: 'ORD-002', table_no: 7, status: 'ready',     total_amount: 820,  created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'ORD-003', table_no: 1, status: 'preparing', total_amount: 430,  created_at: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: 'ORD-004', table_no: 5, status: 'paid',      total_amount: 1290, created_at: new Date(Date.now() - 31 * 60000).toISOString() },
  { id: 'ORD-005', table_no: 2, status: 'paid',      total_amount: 670,  created_at: new Date(Date.now() - 45 * 60000).toISOString() },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt    = (n)  => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
const fmtPct = (n)  => `${n >= 0 ? '+' : ''}${Number(n).toFixed(1)}%`;
const relTime = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const STATUS_STYLE = {
  paid:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  ready:     'bg-orange-500/15  text-orange-400  border-orange-500/25',
  preparing: 'bg-amber-500/15   text-amber-400   border-amber-500/25',
  pending:   'bg-slate-700      text-slate-400   border-slate-600',
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ id, label, value, change, icon, accent }) {
  const isPos = change == null || change >= 0;
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 flex flex-col gap-3
                    hover:border-slate-600 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accent.box}`}>
          {icon}
        </div>
        {change != null && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {fmtPct(change)}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p id={id} className={`text-2xl font-bold ${accent.text} tabular-nums`}>{value}</p>
        {change != null && (
          <p className="text-slate-600 text-xs mt-0.5">vs yesterday</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats,    setStats]    = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, topRes, ordersRes] = await Promise.allSettled([
          authFetch('/reports/today'),
          authFetch('/reports/top-items'),
          authFetch('/orders?limit=5&sort=created_at:desc'),
        ]);
        setStats(   statsRes.status   === 'fulfilled' ? statsRes.value   : MOCK_STATS);
        setTopItems(topRes.status     === 'fulfilled' ? (Array.isArray(topRes.value) ? topRes.value : topRes.value?.items ?? []) : MOCK_TOP_ITEMS);
        setRecent(  ordersRes.status  === 'fulfilled' ? (Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.orders ?? []) : MOCK_RECENT_ORDERS);
      } catch {
        setStats(MOCK_STATS);
        setTopItems(MOCK_TOP_ITEMS);
        setRecent(MOCK_RECENT_ORDERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxRevenue = Math.max(...topItems.map(i => i.revenue), 1);

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25
                             flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
            </span>
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Today's performance at a glance</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-slate-500 text-sm animate-pulse">Loading analytics…</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                id="kpi-revenue"
                label="Today's Revenue"
                value={fmt(stats?.today_revenue ?? 0)}
                change={stats?.revenue_change}
                accent={{ box: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' }}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                }
              />
              <StatCard
                id="kpi-orders"
                label="Orders Today"
                value={stats?.today_orders ?? 0}
                change={stats?.orders_change}
                accent={{ box: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400' }}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                }
              />
              <StatCard
                id="kpi-tables"
                label="Active Tables"
                value={stats?.active_tables ?? 0}
                change={null}
                accent={{ box: 'bg-sky-500/10 border-sky-500/20', text: 'text-sky-400' }}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3h18v4H3z"/><path d="M3 10h18v11H3z"/>
                  </svg>
                }
              />
              <StatCard
                id="kpi-avg"
                label="Avg Order Value"
                value={fmt(stats?.avg_order_value ?? 0)}
                change={null}
                accent={{ box: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400' }}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                }
              />
            </div>

            {/* ── Bottom sections ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top selling items */}
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <h2 className="text-white font-semibold text-sm">Top Selling Items</h2>
                </div>

                <div className="divide-y divide-slate-800">
                  {topItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-xs font-bold w-4 tabular-nums">
                            {i + 1}.
                          </span>
                          <span className="text-white text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-orange-400 font-semibold text-sm tabular-nums">
                            {fmt(item.revenue)}
                          </span>
                          <span className="text-slate-600 text-xs ml-2">×{item.qty}</span>
                        </div>
                      </div>
                      {/* Revenue bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full
                                     transition-all duration-700"
                          style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <h2 className="text-white font-semibold text-sm">Recent Orders</h2>
                </div>

                <div className="divide-y divide-slate-800">
                  {recent.slice(0, 5).map((order, i) => (
                    <div key={order.id ?? i}
                         className="flex items-center justify-between px-5 py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700
                                        flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                          T{order.table_no}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            #{String(order.id).slice(-6)}
                          </p>
                          <p className="text-slate-600 text-xs">{relTime(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          STATUS_STYLE[order.status] ?? STATUS_STYLE.pending
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-white font-semibold text-sm tabular-nums">
                          {fmt(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
