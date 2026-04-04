import Navbar from '../components/Navbar';

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <Navbar />
      <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L9 22h6l1.2-7.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Kitchen Display</h2>
          <p className="text-slate-500 text-sm">Real-time order queue for kitchen staff</p>
        </div>
      </main>
    </div>
  );
}
