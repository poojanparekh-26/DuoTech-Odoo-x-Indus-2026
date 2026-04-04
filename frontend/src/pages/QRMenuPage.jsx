import { useParams } from 'react-router-dom';

export default function QRMenuPage() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            <line x1="14" y1="15" x2="14" y2="15"/><line x1="17" y1="15" x2="17" y2="15"/><line x1="20" y1="15" x2="20" y2="15"/>
            <line x1="14" y1="18" x2="14" y2="18"/><line x1="17" y1="18" x2="17" y2="18"/><line x1="20" y1="18" x2="20" y2="18"/>
            <line x1="14" y1="21" x2="17" y2="21"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">QR Menu</h2>
        <p className="text-slate-500 text-sm mb-3">Guest self-ordering menu</p>
        <span className="inline-block bg-slate-800 text-slate-400 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700">
          token: {token}
        </span>
      </div>
    </div>
  );
}
