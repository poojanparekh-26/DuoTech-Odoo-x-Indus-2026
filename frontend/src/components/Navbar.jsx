import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const rawSession = localStorage.getItem('activeSession');
  const session = rawSession ? JSON.parse(rawSession) : null;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeSession');
    navigate('/login');
  }

  const navLinks = [
    { to: '/', label: 'Floors' },
    { to: '/kitchen', label: 'Kitchen' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center px-6 gap-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
          <span className="text-white font-bold text-sm">POS</span>
        </div>
        <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
          RestoPOS
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(to)
                ? 'bg-orange-500/20 text-orange-400 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Active session badge */}
      {session && (
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">
            Session #{session.id}
          </span>
          {session.openedAt && (
            <span className="text-xs text-slate-500">
              · {new Date(session.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* User + Logout */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-slate-200">{user.name || user.email}</span>
            {user.role && (
              <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {(user.name || user.email || 'U')[0]}
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
