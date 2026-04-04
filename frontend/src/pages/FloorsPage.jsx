import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authFetch } from '../api';

// ─── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_FLOORS = [
  { id: 1, name: 'Ground Floor', tableCount: 8 },
  { id: 2, name: 'First Floor',  tableCount: 6 },
  { id: 3, name: 'Rooftop',      tableCount: 4 },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="w-12 h-12 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
      <p className="text-slate-400 text-sm animate-pulse">Loading floors…</p>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-orange-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">No floors yet</h3>
        <p className="text-slate-500 text-sm">Create your first floor to start managing tables.</p>
      </div>
      <button
        id="empty-add-floor-btn"
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Floor
      </button>
    </div>
  );
}

function FloorCard({ floor, onClick }) {
  return (
    <button
      id={`floor-card-${floor.id}`}
      onClick={() => onClick(floor)}
      className="group relative w-full text-left bg-slate-900 border border-slate-700/60 hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>

        {/* Arrow */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-200 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <div className="relative mt-4">
        <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-orange-50 transition-colors duration-200">
          {floor.name}
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          {floor.tableCount ?? 0} table{floor.tableCount !== 1 ? 's' : ''}
        </p>
      </div>
    </button>
  );
}

function CreateFloorModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Floor name is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const created = await authFetch('/floors', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed }),
      });
      onCreated(created);
    } catch (err) {
      // Optimistic mock insert if backend unavailable
      onCreated({ id: Date.now(), name: trimmed, tableCount: 0 });
    } finally {
      setLoading(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 animate-[fadeInUp_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">New Floor</h2>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="floor-name-input">
              Floor Name
            </label>
            <input
              id="floor-name-input"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Ground Floor, Rooftop…"
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-200"
            />
            {error && <p className="mt-1.5 text-rose-400 text-xs">{error}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              id="cancel-floor-btn"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-floor-btn"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-orange-500/30"
            >
              {loading ? 'Creating…' : 'Create Floor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FloorsPage() {
  const navigate = useNavigate();
  const [floors, setFloors]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authFetch('/floors');
        if (!cancelled) setFloors(Array.isArray(data) ? data : data.floors ?? []);
      } catch {
        if (!cancelled) setFloors(MOCK_FLOORS); // graceful fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function handleFloorClick(floor) {
    navigate(`/tables?floorId=${floor.id}`);
  }

  function handleCreated(floor) {
    setFloors(prev => [...prev, floor]);
    setShowModal(false);
  }

  return (
    <>
      <div className="min-h-screen bg-slate-950 pt-16">
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Floors</h1>
              <p className="text-slate-500 text-sm mt-0.5">Select a floor to manage its tables</p>
            </div>
            {!loading && floors.length > 0 && (
              <button
                id="add-floor-btn"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40 hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Floor
              </button>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <Spinner />
          ) : floors.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map(floor => (
                <FloorCard key={floor.id} floor={floor} onClick={handleFloorClick} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <CreateFloorModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
