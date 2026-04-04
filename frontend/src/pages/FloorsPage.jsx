import Navbar from '../components/Navbar';

export default function FloorsPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />
      <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Floors</h2>
          <p className="text-slate-500 text-sm">Select a floor to manage tables</p>
        </div>
      </main>
    </div>
  );
}
