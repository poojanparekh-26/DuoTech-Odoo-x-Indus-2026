import { useState, useEffect } from 'react';
import { authFetch } from '../api';

// ─── Mock variants (fallback) ──────────────────────────────────────────────────
function mockVariants(productId) {
  return [
    { id: `m-${productId}-1`, attribute: 'Size', value: 'Regular', extra_price: 0 },
    { id: `m-${productId}-2`, attribute: 'Size', value: 'Large',   extra_price: 30 },
  ];
}

// ─── Currency formatter ────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toFixed(2)}`;

// ─── ProductCard ───────────────────────────────────────────────────────────────
/**
 * Props:
 *   product  – { id, name, price, description, image_url, category_color }
 *   onAdd    – (product, variant | null) => void
 */
export default function ProductCard({ product, onAdd }) {
  const [variants, setVariants]         = useState([]);
  const [selectedVariant, setSelected]   = useState(null);
  const [loadingVars, setLoadingVars]    = useState(true);
  const [added, setAdded]               = useState(false);   // brief flash feedback

  // Fetch variants on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/variants?productId=${product.id}`);
        const rows = Array.isArray(res) ? res : res.data ?? [];
        if (!cancelled) {
          setVariants(rows);
          setSelected(rows.length > 0 ? rows[0] : null);
        }
      } catch {
        if (!cancelled) {
          const fallback = mockVariants(product.id);
          setVariants(fallback);
          setSelected(fallback[0]);
        }
      } finally {
        if (!cancelled) setLoadingVars(false);
      }
    })();
    return () => { cancelled = true; };
  }, [product.id]);

  const extraPrice   = selectedVariant ? Number(selectedVariant.extra_price ?? 0) : 0;
  const displayPrice = Number(product.price ?? 0) + extraPrice;

  function handleAdd() {
    onAdd(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  function handleVariantChange(e) {
    const found = variants.find(v => String(v.id) === e.target.value);
    setSelected(found ?? null);
  }

  // Accent color from category (backend provides hex), fallback to indigo
  const accent = product.category_color ?? '#6366f1';

  return (
    <div
      className="group flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden
                 transition-all duration-200 hover:border-slate-600 hover:-translate-y-0.5
                 hover:shadow-lg hover:shadow-black/30"
      style={{ '--accent': accent }}
    >
      {/* Colour band at top */}
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + description */}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-slate-100">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-white font-bold text-base">{fmt(displayPrice)}</span>
          {extraPrice > 0 && (
            <span className="text-slate-500 text-xs line-through">{fmt(product.price)}</span>
          )}
        </div>

        {/* Variant selector */}
        {loadingVars ? (
          <div className="h-8 rounded-lg bg-slate-800 animate-pulse" />
        ) : variants.length > 0 ? (
          <div className="relative">
            <select
              id={`variant-select-${product.id}`}
              value={selectedVariant ? String(selectedVariant.id) : ''}
              onChange={handleVariantChange}
              className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600
                         text-slate-300 text-xs rounded-lg px-3 py-2 pr-8 outline-none
                         focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {variants.map(v => (
                <option key={v.id} value={String(v.id)}>
                  {v.attribute}: {v.value}
                  {Number(v.extra_price) > 0 ? ` (+${fmt(v.extra_price)})` : ''}
                </option>
              ))}
            </select>
            {/* Custom chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        ) : (
          <p className="text-slate-600 text-xs italic">No variants</p>
        )}

        {/* Add button */}
        <button
          id={`add-to-cart-${product.id}`}
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold
                      transition-all duration-200 active:scale-95
                      ${added
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-400/30'
                      }`}
        >
          {added ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Added
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
