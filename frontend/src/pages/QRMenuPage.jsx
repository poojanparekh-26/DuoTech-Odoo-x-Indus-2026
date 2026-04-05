import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toFixed(0)}`;

// ─── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_CATEGORIES = ['All', 'Starters', 'Mains', 'Breads', 'Drinks', 'Desserts'];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Paneer Tikka',      category: 'Starters', price: 280, description: 'Marinated cottage cheese grilled in tandoor.' },
  { id: 2, name: 'Veg Spring Rolls',  category: 'Starters', price: 180, description: 'Crispy rolls filled with seasoned vegetables.' },
  { id: 3, name: 'Dal Makhani',       category: 'Mains',    price: 220, description: 'Creamy black lentils slow-cooked overnight.' },
  { id: 4, name: 'Paneer Butter Masala', category: 'Mains', price: 260, description: 'Soft paneer in rich tomato-butter gravy.' },
  { id: 5, name: 'Butter Naan',       category: 'Breads',   price: 40,  description: 'Soft leavened bread brushed with butter.' },
  { id: 6, name: 'Garlic Naan',       category: 'Breads',   price: 50,  description: 'Naan topped with garlic and fresh cilantro.' },
  { id: 7, name: 'Mango Lassi',       category: 'Drinks',   price: 90,  description: 'Chilled yoghurt smoothie with fresh mango.' },
  { id: 8, name: 'Masala Chai',       category: 'Drinks',   price: 60,  description: 'Spiced Indian tea with milk.' },
  { id: 9, name: 'Gulab Jamun',       category: 'Desserts', price: 80,  description: 'Soft dumplings soaked in rose-flavoured syrup.' },
  { id: 10, name: 'Kheer',            category: 'Desserts', price: 100, description: 'Creamy rice pudding with cardamom and nuts.' },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCardQR({ product, qty, onAdd, onRemove }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
                    hover:shadow-md transition-shadow duration-200">
      {/* Colour band based on category */}
      <div className={`h-1.5 w-full ${
        product.category === 'Starters'  ? 'bg-orange-400' :
        product.category === 'Mains'     ? 'bg-rose-500'   :
        product.category === 'Breads'    ? 'bg-amber-400'  :
        product.category === 'Drinks'    ? 'bg-teal-400'   :
        product.category === 'Desserts'  ? 'bg-pink-400'   :
        'bg-indigo-400'
      }`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-gray-900 font-semibold text-[15px] leading-snug">{product.name}</h3>
          <span className="text-teal-600 font-bold text-[15px] shrink-0">{fmt(product.price)}</span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">{product.description}</p>

        {qty === 0 ? (
          <button
            id={`qr-add-${product.id}`}
            onClick={() => onAdd(product)}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white
                       text-sm font-semibold transition-all duration-200 active:scale-95
                       shadow-sm shadow-teal-500/30"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-teal-50 rounded-xl px-2 py-1.5">
            <button
              id={`qr-remove-${product.id}`}
              onClick={() => onRemove(product.id)}
              className="w-8 h-8 rounded-lg bg-white border border-teal-200 text-teal-600
                         font-bold text-lg leading-none flex items-center justify-center
                         hover:bg-teal-100 active:scale-95 transition-all"
            >
              –
            </button>
            <span className="text-teal-700 font-bold text-sm tabular-nums">{qty}</span>
            <button
              id={`qr-inc-${product.id}`}
              onClick={() => onAdd(product)}
              className="w-8 h-8 rounded-lg bg-teal-500 text-white font-bold text-lg
                         leading-none flex items-center justify-center hover:bg-teal-400
                         active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, products, onRemove, onAdd, onClose, onCheckout, checking }) {
  const items = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...products.find(p => p.id === Number(id)), qty }));

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-3xl max-h-[82vh] flex flex-col overflow-hidden
                   shadow-2xl animate-[slideUp_0.25s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg">Your Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium text-sm truncate">{item.name}</p>
                <p className="text-gray-500 text-xs">{fmt(item.price)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(item.id)}
                        className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500
                                   font-bold text-base flex items-center justify-center
                                   hover:border-rose-300 hover:text-rose-500 transition-all">
                  –
                </button>
                <span className="text-gray-800 font-semibold text-sm w-5 text-center tabular-nums">{item.qty}</span>
                <button onClick={() => onAdd(item)}
                        className="w-7 h-7 rounded-lg bg-teal-500 text-white font-bold
                                   text-base flex items-center justify-center
                                   hover:bg-teal-400 transition-all">
                  +
                </button>
              </div>

              <span className="text-teal-600 font-semibold text-sm tabular-nums w-16 text-right">
                {fmt(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-6 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-gray-900 font-extrabold text-xl tabular-nums">{fmt(total)}</span>
          </div>
          <button
            id="qr-checkout-btn"
            onClick={onCheckout}
            disabled={checking || items.length === 0}
            className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60
                       text-white font-bold text-[15px] transition-all duration-200 active:scale-[0.98]
                       shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order…
              </>
            ) : (
              `Place Order · ${fmt(total)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function QRMenuPage() {
  const { token }   = useParams();
  const navigate    = useNavigate();

  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [cart,      setCart]      = useState({});    // { [productId]: qty }
  const [showCart,  setShowCart]  = useState(false);
  const [checking,  setChecking]  = useState(false);
  const [error,     setError]     = useState('');

  // ── Fetch menu ───────────────────────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/qr-menu?token=${token}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products ?? MOCK_PRODUCTS);
    } catch {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  function addToCart(product) {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
  }

  function removeFromCart(id) {
    setCart(prev => {
      const next = { ...prev };
      if ((next[id] ?? 0) > 1) next[id]--;
      else delete next[id];
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  // ── Checkout ─────────────────────────────────────────────────────────────────
  async function handleCheckout() {
    if (checking) return;
    setChecking(true);
    setError('');

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const p = products.find(p => p.id === Number(id));
        return { product_id: Number(id), quantity: qty, unit_price: p?.price ?? 0 };
      });

    try {
      const res = await fetch('/api/qr-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, items }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Order failed');

      const orderId = data?.order_id ?? data?.id ?? 'DEMO-' + Date.now();
      const total   = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

      navigate('/qr-confirm', {
        state: { orderId, items: items.map(i => ({
          ...i,
          name: products.find(p => p.id === i.product_id)?.name ?? `Product #${i.product_id}`,
        })), total },
      });
    } catch (err) {
      // Demo fallback: navigate with mock data
      const total = Object.entries(cart).reduce((s, [id, qty]) => {
        const p = products.find(p => p.id === Number(id));
        return s + (p?.price ?? 0) * qty;
      }, 0);
      navigate('/qr-confirm', {
        state: {
          orderId: 'DEMO-' + Date.now(),
          items: Object.entries(cart).map(([id, qty]) => {
            const p = products.find(p => p.id === Number(id));
            return { product_id: Number(id), name: p?.name ?? `#${id}`, quantity: qty, unit_price: p?.price ?? 0 };
          }),
          total,
          demo: true,
        },
      });
    } finally {
      setChecking(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const visible    = category === 'All' ? products : products.filter(p => p.category === category);

  // ─ Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Top header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 font-bold text-xl leading-none">Menu</h1>
            <p className="text-gray-400 text-xs mt-0.5">Scan & Order</p>
          </div>
          <button
            id="qr-open-cart-btn"
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 text-white
                       text-sm font-semibold shadow-md shadow-teal-500/30 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500
                               text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Category tabs ── */}
        {!loading && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                id={`qr-cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${category === cat
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <main className="max-w-lg mx-auto px-4 py-5">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-teal-400/30 border-t-teal-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading menu…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visible.map(product => (
              <ProductCardQR
                key={product.id}
                product={product}
                qty={cart[product.id] ?? 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Sticky bottom cart bar ── */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6">
          <button
            id="qr-view-cart-btn"
            onClick={() => setShowCart(true)}
            className="w-full max-w-lg mx-auto flex items-center justify-between
                       bg-teal-500 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-teal-500/40
                       font-semibold text-[15px] transition-all active:scale-[0.98]"
          >
            <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center
                             text-sm font-bold">{cartCount}</span>
            <span>View Cart</span>
            <span className="tabular-nums">
              {fmt(Object.entries(cart).reduce((s, [id, qty]) => {
                const p = products.find(p => p.id === Number(id));
                return s + (p?.price ?? 0) * qty;
              }, 0))}
            </span>
          </button>
        </div>
      )}

      {/* ── Cart drawer ── */}
      {showCart && (
        <CartDrawer
          cart={cart}
          products={products}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
          checking={checking}
        />
      )}

      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}
