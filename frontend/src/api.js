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
  console.log(email, password);
  // const res = await fetch(`${BASE}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });

  // const data = await res.json();

  // if (!res.ok) {
  //   throw new Error(data?.detail || data?.message || 'Login failed');
  // }

  return { token: "", user: { name: "Patel Aarya"} }; // { token, user }
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
    source: 'pos',
    items: items.map((cartItem) => ({
      product_id: Number(cartItem.product.id),
      variant_id: cartItem.variant && !isMockId(cartItem.variant.id)
        ? Number(cartItem.variant.id)
        : null,
      quantity: cartItem.qty,
      unit_price: cartItem.unitPrice,
    })),
  };

  return authFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  // Returns: { success, order_id, status, total_amount, created_at, items }
}

// ─── Payments API ─────────────────────────────────────────────────────────────
export async function processPayment(orderId, amount, method) {
  return authFetch('/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, amount, method }),
  });
}

// ─── Kitchen API ──────────────────────────────────────────────────────────────
export async function getKitchenOrders() {
  return authFetch('/kitchen/orders');
}

export async function updateKitchenStatus(orderId, status) {
  return authFetch(`/kitchen/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── QR Menu API ──────────────────────────────────────────────────────────────
export async function submitQROrder(token, items) {
  const res = await fetch(`${BASE}/qr-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'QR Order failed');
  return data;
}

// ─── Dashboard API ────────────────────────────────────────────────────────────
export async function getReportsSummary() {
  return authFetch('/reports/summary');
}
