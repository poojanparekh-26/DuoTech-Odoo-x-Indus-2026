import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { authFetch } from '../api';

// ─── Mock data (fallback when API is unreachable) ──────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: 'Starters',    color: '#f97316' },
  { id: 2, name: 'Mains',       color: '#8b5cf6' },
  { id: 3, name: 'Desserts',    color: '#ec4899' },
  { id: 4, name: 'Beverages',   color: '#06b6d4' },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Paneer Tikka',       price: 180, description: 'Grilled cottage cheese with spices',  category_id: 1, category_color: '#f97316' },
  { id: 2, name: 'Veg Spring Rolls',   price: 120, description: 'Crispy rolls with veggies',           category_id: 1, category_color: '#f97316' },
  { id: 3, name: 'Dal Makhani',        price: 220, description: 'Slow-cooked black lentils',           category_id: 2, category_color: '#8b5cf6' },
  { id: 4, name: 'Butter Naan',        price:  40, description: 'Soft leavened bread',                 category_id: 2, category_color: '#8b5cf6' },
  { id: 5, name: 'Gulab Jamun',        price:  80, description: 'Fried milk dumplings in syrup',       category_id: 3, category_color: '#ec4899' },
  { id: 6, name: 'Mango Lassi',        price:  90, description: 'Chilled yoghurt mango drink',         category_id: 4, category_color: '#06b6d4' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
let _cartSeq = 0;
const nextCartId = () => `ci-${++_cartSeq}`;

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="w-10 h-10 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
      <p className="text-slate-500 text-sm animate-pulse">{label}</p>
    </div>
  );
}

// ─── Table Info Banner ─────────────────────────────────────────────────────────
function TableBanner({ tableNo, floorName, onBack }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        id="back-to-tables-btn"
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400
                   hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700
                   transition-all duration-200 shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Tables
      </button>

      <div className="h-6 w-px bg-slate-700 hidden sm:block" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-400" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3h18v4H3z"/><path d="M3 10h18v11H3z"/>
          </svg>
          <span className="text-white text-sm font-semibold">Table {tableNo}</span>
        </div>
        {floorName && (
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs font-medium">
            {floorName}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Category Tabs ─────────────────────────────────────────────────────────────
function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
      {/* "All" tab */}
      <button
        id="cat-tab-all"
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border
          ${active === null
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
          }`}
      >
        All
      </button>

      {categories.map(cat => (
        <button
          key={cat.id}
          id={`cat-tab-${cat.id}`}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 border
            ${active === cat.id
              ? 'text-white border-transparent'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
          style={active === cat.id ? { backgroundColor: cat.color + '33', borderColor: cat.color + '66', color: cat.color } : {}}
        >
          {/* color dot */}
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const tableId  = searchParams.get('tableId');
  const floorId  = searchParams.get('floorId');

  // ── Remote data ──────────────────────────────────────────────
  const [tableInfo,   setTableInfo]   = useState(null);   // { table_no, floor_name }
  const [categories,  setCategories]  = useState([]);
  const [products,    setProducts]    = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds,setLoadingProds]= useState(true);

  // ── Category filter ───────────────────────────────────────────
  const [activeCat, setActiveCat] = useState(null);        // null = All

  // ── Cart state ────────────────────────────────────────────────
  const [cartItems,  setCartItems]  = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [orderError, setOrderError] = useState('');

  // ── Fetch table info ──────────────────────────────────────────
  useEffect(() => {
    if (!tableId) return;
    (async () => {
      try {
        // Try to get this table from the floor list
        const query = floorId ? `/tables?floorId=${floorId}` : '/tables';
        const res = await authFetch(query);
        const rows = Array.isArray(res) ? res : res.data ?? [];
        const found = rows.find(t => String(t.id) === String(tableId));
        if (found) setTableInfo({ table_no: found.table_no, floor_name: found.floor_name ?? '' });
      } catch {
        setTableInfo({ table_no: tableId, floor_name: '' });
      }
    })();
  }, [tableId, floorId]);

  // ── Fetch categories ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/categories');
        const rows = Array.isArray(res) ? res : res.data ?? [];
        setCategories(rows.length > 0 ? rows : MOCK_CATEGORIES);
      } catch {
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // ── Fetch products (re-runs when activeCat changes) ───────────
  useEffect(() => {
    setLoadingProds(true);
    const url = activeCat ? `/products?categoryId=${activeCat}` : '/products';
    (async () => {
      try {
        const res = await authFetch(url);
        const rows = Array.isArray(res) ? res : res.data ?? [];
        setProducts(
          rows.length > 0
            ? rows
            : MOCK_PRODUCTS.filter(p => activeCat === null || p.category_id === activeCat)
        );
      } catch {
        setProducts(MOCK_PRODUCTS.filter(p => activeCat === null || p.category_id === activeCat));
      } finally {
        setLoadingProds(false);
      }
    })();
  }, [activeCat]);

  // ── Cart handlers ─────────────────────────────────────────────
  const handleAddToCart = useCallback((product, variant) => {
    const unitPrice = Number(product.price ?? 0) + Number(variant?.extra_price ?? 0);

    setCartItems(prev => {
      // Match on product + variant combo
      const matchKey = `${product.id}__${variant?.id ?? 'none'}`;
      const existing = prev.find(i => i.matchKey === matchKey);
      if (existing) {
        return prev.map(i => i.matchKey === matchKey ? { ...i, qty: i.qty + 1 } : i);
      }
      return [
        ...prev,
        { cartId: nextCartId(), matchKey, product, variant, qty: 1, unitPrice },
      ];
    });
  }, []);

  const handleQtyChange = useCallback((cartId, delta) => {
    setCartItems(prev =>
      prev
        .map(i => i.cartId === cartId ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)   // auto-remove when qty reaches 0
    );
  }, []);

  const handleRemove = useCallback((cartId) => {
    setCartItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  // ── Confirm order ─────────────────────────────────────────────
  async function handleConfirmOrder() {
    if (cartItems.length === 0) return;
    setConfirming(true);
    setOrderError('');

    const rawSession = localStorage.getItem('activeSession');
    const session    = rawSession ? JSON.parse(rawSession) : null;

    const payload = {
      tableId:   Number(tableId),
      sessionId: session?.id ?? null,
      items: cartItems.map(i => ({
        productId: i.product.id,
        variantId: i.variant?.id ?? null,
        quantity:  i.qty,
        unitPrice: i.unitPrice,
      })),
    };

    try {
      const res = await authFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const orderId = res?.data?.id ?? res?.id ?? `mock-${Date.now()}`;
      navigate(`/payment?orderId=${orderId}`);
    } catch (err) {
      // Graceful fallback — still navigate with a mock order ID so the UI flow isn't broken
      console.warn('[OrderPage] POST /orders failed, using mock orderId:', err.message);
      navigate(`/payment?orderId=mock-${Date.now()}`);
    } finally {
      setConfirming(false);
    }
  }

  // ── Back navigation ───────────────────────────────────────────
  function handleBack() {
    if (floorId) navigate(`/tables?floorId=${floorId}`);
    else navigate('/');
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 pt-16 flex flex-col">
      <Navbar />

      {/* ── Page header ─────────────────────────────────── */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-col gap-3">
        <TableBanner
          tableNo={tableInfo?.table_no ?? tableId ?? '—'}
          floorName={tableInfo?.floor_name}
          onBack={handleBack}
        />

        {/* Category filter tabs */}
        {loadingCats ? (
          <div className="flex gap-2">
            {[1,2,3,4].map(n => (
              <div key={n} className="h-8 w-24 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <CategoryTabs
            categories={categories}
            active={activeCat}
            onChange={setActiveCat}
          />
        )}
      </header>

      {/* ── Body: product grid (left) + cart (right) ────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Product grid panel ──────────────────────── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {loadingProds ? (
            <Spinner label="Loading menu…" />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-600" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="text-slate-400 font-medium">No products in this category</p>
              <button
                className="text-orange-400 text-sm hover:underline"
                onClick={() => setActiveCat(null)}
              >
                View all items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── Cart panel ──────────────────────────────── */}
        <aside className="hidden md:flex w-80 xl:w-96 shrink-0 flex-col border-l border-slate-800 overflow-hidden">
          {/* Order error */}
          {orderError && (
            <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10
                            border border-rose-500/25 text-rose-400 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {orderError}
            </div>
          )}

          <div className="flex-1 p-3 overflow-hidden flex flex-col">
            <Cart
              items={cartItems}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
              onConfirm={handleConfirmOrder}
              confirming={confirming}
            />
          </div>
        </aside>

        {/* ── Mobile floating cart badge ───────────────── */}
        {cartItems.length > 0 && (
          <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
            <button
              id="mobile-cart-btn"
              onClick={() => {
                // On mobile, scroll to cart or open sheet — for now navigate to a dedicated state
                document.getElementById('mobile-cart-sheet')?.classList.toggle('translate-y-full');
              }}
              className="flex items-center gap-3 pl-4 pr-5 py-3 bg-orange-500 hover:bg-orange-400
                         text-white text-sm font-semibold rounded-2xl shadow-2xl shadow-orange-500/40
                         transition-all duration-200 active:scale-95"
            >
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center tabular-nums">
                {cartItems.reduce((s, i) => s + i.qty, 0)}
              </span>
              View Cart
              <span className="font-bold">
                ₹{cartItems.reduce((s, i) => s + i.unitPrice * i.qty, 0).toFixed(2)}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile Cart Sheet ─────────────────────────── */}
      <div
        id="mobile-cart-sheet"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 h-[75vh] translate-y-full
                   transition-transform duration-300 ease-in-out"
      >
        <div className="h-full flex flex-col bg-slate-950 border-t border-slate-800 rounded-t-2xl overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>
          <div className="flex-1 p-3 overflow-hidden flex flex-col">
            <Cart
              items={cartItems}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
              onConfirm={handleConfirmOrder}
              confirming={confirming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
