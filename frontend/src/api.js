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

// ─── Orders API ───────────────────────────────────────────────────────────────

/**
 * Create a new order.
 *
 * @param {Object} params
 * @param {number|null} params.tableId   - DB id of the table (may be null for takeaway)
 * @param {Array}       params.items     - CartItem[] from OrderPage state
 *
 * Each CartItem is shaped as:
 *   { product: { id }, variant: { id, extra_price } | null, qty, unitPrice }
 *
 * Maps to the backend body:
 * {
 *   table_id : number | null,
 *   source   : "pos",
 *   items    : [{ product_id, variant_id, quantity, unit_price }]
 * }
 *
 * Returns the raw backend response:
 * { success, order_id, status, total_amount, items }
 */
export async function createOrder({ tableId, items }) {
  // variant.id values that start with "m-" are client-side mock ids →
  // the backend has no matching row, so we must send null to avoid FK errors.
  const isMockId = (id) => typeof id === 'string' && id.startsWith('m-');

  const payload = {
    table_id: tableId ? Number(tableId) : null,
    source:   'pos',
    items: items.map((cartItem) => ({
      product_id: Number(cartItem.product.id),
      variant_id: cartItem.variant && !isMockId(cartItem.variant.id)
                    ? Number(cartItem.variant.id)
                    : null,
      quantity:   cartItem.qty,
      unit_price: cartItem.unitPrice,
    })),
  };

  return authFetch('/orders', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
  // Returns: { success, order_id, status, total_amount, created_at, items }
}
