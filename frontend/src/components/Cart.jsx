/**
 * Cart.jsx
 *
 * Props:
 *   items         – CartItem[]  { cartId, product, variant, qty, unitPrice }
 *   onQtyChange   – (cartId, delta: +1 | -1) => void
 *   onRemove      – (cartId) => void
 *   onConfirm     – () => void   (called when "Confirm Order" is clicked)
 *   confirming    – boolean      (loading state while POST /orders in flight)
 */

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

function CartItem({ item, onQtyChange, onRemove }) {
  const subtotal = item.unitPrice * item.qty;

  return (
    <div className="group flex flex-col gap-2 px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors duration-150">
      {/* Name + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-snug truncate">{item.product.name}</p>
          {item.variant && (
            <p className="text-slate-500 text-xs mt-0.5">
              {item.variant.attribute}: {item.variant.value}
            </p>
          )}
        </div>
        <button
          id={`remove-item-${item.cartId}`}
          onClick={() => onRemove(item.cartId)}
          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-600
                     hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 opacity-0
                     group-hover:opacity-100"
          aria-label="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Qty controls + subtotal */}
      <div className="flex items-center justify-between">
        {/* ─ / qty / + */}
        <div className="flex items-center gap-1">
          <button
            id={`qty-dec-${item.cartId}`}
            onClick={() => onQtyChange(item.cartId, -1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700
                       text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-150
                       active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          <span className="w-7 text-center text-white text-sm font-semibold tabular-nums select-none">
            {item.qty}
          </span>

          <button
            id={`qty-inc-${item.cartId}`}
            onClick={() => onQtyChange(item.cartId, +1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700
                       text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-150
                       active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* unit price × qty = subtotal */}
        <div className="text-right">
          <span className="text-orange-400 font-semibold text-sm tabular-nums">{fmt(subtotal)}</span>
          <p className="text-slate-600 text-xs tabular-nums">{fmt(item.unitPrice)} × {item.qty}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-600" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <div>
        <p className="text-slate-300 font-medium text-sm">Cart is empty</p>
        <p className="text-slate-600 text-xs mt-0.5">Add items from the menu</p>
      </div>
    </div>
  );
}

// ─── Cart ──────────────────────────────────────────────────────────────────────
export default function Cart({ items = [], onQtyChange, onRemove, onConfirm, confirming = false }) {
  const hasSession = !!localStorage.getItem('activeSession');
  const isEmpty    = items.length === 0;
  const total      = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const itemCount  = items.reduce((sum, i) => sum + i.qty, 0);
  const canConfirm = !isEmpty && hasSession && !confirming;

  return (
    <aside className="flex flex-col h-full bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-400" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <h2 className="text-white font-semibold text-sm">Order Cart</h2>
        </div>
        {itemCount > 0 && (
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold
                           flex items-center justify-center tabular-nums">
            {itemCount}
          </span>
        )}
      </div>

      {/* ── No active session warning ── */}
      {!hasSession && (
        <div className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-xl bg-amber-500/10
                        border border-amber-500/25 text-amber-400 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          No active session — open a session to confirm orders.
        </div>
      )}

      {/* ── Item list (scrollable) ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div>
            {items.map(item => (
              <CartItem
                key={item.cartId}
                item={item}
                onQtyChange={onQtyChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-slate-800 px-4 py-4 space-y-3">
        {/* Totals */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Total</p>
            <p className="text-white font-bold text-xl tabular-nums leading-none">{fmt(total)}</p>
          </div>
        </div>

        {/* Confirm button */}
        <button
          id="confirm-order-btn"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                      transition-all duration-200 active:scale-[0.98]
                      ${canConfirm
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                      }`}
        >
          {confirming ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Placing Order…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Confirm Order
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
