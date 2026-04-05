import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, signup } from '../api';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [tab,     setTab]     = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Login fields
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [signupName,     setSignupName]     = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  function switchTab(t) {
    setTab(t);
    setError('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(loginEmail, loginPassword);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await signup(signupName, signupEmail, signupPassword);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[400px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-rose-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-xl shadow-orange-500/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RestoPOS</h1>
          <p className="text-sm text-slate-500 mt-1">Point of Sale Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-800">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all duration-200 ${
                  tab === t
                    ? 'text-orange-400 bg-orange-500/10 border-b-2 border-orange-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl px-4 py-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <Field
                  id="login-email"
                  label="Email address"
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                  required
                />
                <Field
                  id="login-password"
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <SubmitButton loading={loading} label="Sign In" />
              </form>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="flex flex-col gap-5">
                <Field
                  id="signup-name"
                  label="Full name"
                  type="text"
                  value={signupName}
                  onChange={setSignupName}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
                <Field
                  id="signup-email"
                  label="Email address"
                  type="email"
                  value={signupEmail}
                  onChange={setSignupEmail}
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                  required
                />
                <Field
                  id="signup-password"
                  label="Password"
                  type="password"
                  value={signupPassword}
                  onChange={setSignupPassword}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                />
                <SubmitButton loading={loading} label="Create Account" />
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} RestoPOS · All rights reserved
        </p>
      </div>
    </div>
  );
}

/* ─── Small sub-components ─────────────────────────────────────────────────── */

function Field({ id, label, type, value, onChange, placeholder, autoComplete, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
      />
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {loading ? 'Please wait…' : label}
    </button>
  );
}
