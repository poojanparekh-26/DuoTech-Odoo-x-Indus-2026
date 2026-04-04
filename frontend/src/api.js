const BASE = '/api';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStoredToken() {
  return localStorage.getItem('token');
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * On success the server returns { token, user }.
 * This function returns the raw response JSON — callers handle storage.
 */
export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || 'Login failed');
  }

  return data; // { token, user }
}

/**
 * Register a new account.
 * On success the server returns { token, user }.
 */
export async function signup(name, email, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || 'Signup failed');
  }

  return data; // { token, user }
}

// ─── Generic authenticated request ────────────────────────────────────────────

export async function authFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
