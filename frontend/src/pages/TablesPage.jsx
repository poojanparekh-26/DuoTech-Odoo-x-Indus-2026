import Navbar from '../components/Navbar';

export default function TablesPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />
      <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h18v4H3zM3 10h18v11H3z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Tables</h2>
          <p className="text-slate-500 text-sm">View and manage restaurant tables</p>
        </div>
      </main>
    </div>
  );
}
