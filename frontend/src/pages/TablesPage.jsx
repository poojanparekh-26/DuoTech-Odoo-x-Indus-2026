import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authFetch } from '../api';

// ─── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_TABLES = [
  { id: 1, tableNumber: 1, seatCount: 4, status: 'available' },
  { id: 2, tableNumber: 2, seatCount: 2, status: 'occupied'  },
  { id: 3, tableNumber: 3, seatCount: 6, status: 'available' },
  { id: 4, tableNumber: 4, seatCount: 4, status: 'occupied'  },
  { id: 5, tableNumber: 5, seatCount: 8, status: 'available' },
  { id: 6, tableNumber: 6, seatCount: 2, status: 'available' },
];

// ─── TableCard ─────────────────────────────────────────────────────────────────

function TableCard({ table, floorId, onClick }) {
  const isAvailable = table.status === 'available';

  return (
    <button
      id={`table-card-${table.id}`}
      onClick={() => onClick(table)}
      className={`group relative w-full text-left rounded-2xl border p-5 transition-all duration-200 focus:outline-none focus:ring-2 hover:-translate-y-0.5 hover:shadow-xl ${
        isAvailable
          ? 'bg-slate-900 border-slate-700/60 hover:border-emerald-500/50 hover:shadow-emerald-500/10 focus:ring-emerald-500/50'
          : 'bg-slate-900 border-slate-700/60 hover:border-rose-500/50 hover:shadow-rose-500/10 focus:ring-rose-500/50'
      }`}
    >
      {/* Glow overlay */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br ${
        isAvailable ? 'from-emerald-500/5' : 'from-rose-500/5'
      } to-transparent`} />

      {/* Status badge */}
      <div className="relative flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isAvailable
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'} ${isAvailable ? 'animate-pulse' : ''}`} />
          {isAvailable ? 'Available' : 'Occupied'}
        </span>

        {/* Seat count chip */}
        <span className="flex items-center gap-1 text-slate-500 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {table.seatCount}
        </span>
      </div>

      {/* Table number */}
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-3 ${
          isAvailable
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {table.tableNumber}
        </div>
        <p className="text-white font-semibold text-base group-hover:text-slate-100 transition-colors">
          Table {table.tableNumber}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {table.seatCount} seat{table.seatCount !== 1 ? 's' : ''}
        </p>
      </div>
    </button>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="w-12 h-12 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
      <p className="text-slate-400 text-sm animate-pulse">Loading tables…</p>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ floorId }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3h18v4H3z"/><path d="M3 10h18v11H3z"/>
        </svg>
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">No tables found</h3>
        <p className="text-slate-500 text-sm">There are no tables configured for this floor.</p>
      </div>
    </div>
  );
}

// ─── Summary Bar ───────────────────────────────────────────────────────────────

function SummaryBar({ tables }) {
  const available = tables.filter(t => t.status === 'available').length;
  const occupied  = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
        <span className="text-slate-400">Total:</span> {tables.length}
      </span>
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs font-medium text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available: {available}
      </span>
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs font-medium text-rose-400">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Occupied: {occupied}
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const floorId                 = searchParams.get('floorId');

  const [tables, setTables]     = useState([]);
  const [floorName, setFloorName] = useState('');
  const [loading, setLoading]   = useState(true);

  // Fetch floor details (for display name) + tables
  useEffect(() => {
    if (!floorId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        // Attempt to resolve floor name
        const floorData = await authFetch(`/floors/${floorId}`).catch(() => null);
        if (!cancelled && floorData) setFloorName(floorData.name ?? '');

        // Fetch tables for this floor
        const data = await authFetch(`/tables?floorId=${floorId}`);
        if (!cancelled) setTables(Array.isArray(data) ? data : data.tables ?? []);
      } catch {
        if (!cancelled) setTables(MOCK_TABLES); // graceful fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [floorId]);

  function handleTableClick(table) {
    navigate(`/order?tableId=${table.id}&floorId=${floorId}`);
  }

  const pageTitle = floorName || (floorId ? `Floor ${floorId}` : 'Tables');

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              id="back-to-floors-btn"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all duration-200 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Floors
            </button>

            <div className="h-6 w-px bg-slate-700" />

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{pageTitle}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Click a table to open an order</p>
            </div>
          </div>

          {/* Live summary */}
          {!loading && tables.length > 0 && <SummaryBar tables={tables} />}
        </div>

        {/* Grid / States */}
        {loading ? (
          <Spinner />
        ) : !floorId ? (
          <div className="text-center py-24 text-slate-500">
            No floor selected. <button className="text-orange-400 hover:underline" onClick={() => navigate('/')}>Go back to Floors.</button>
          </div>
        ) : tables.length === 0 ? (
          <EmptyState floorId={floorId} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                floorId={floorId}
                onClick={handleTableClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
