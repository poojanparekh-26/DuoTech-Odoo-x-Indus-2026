// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/store/posStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const usePosStore = create(
  persist(
    (set, get) => ({
      currentSession: null,
      currentTable: null,
      cart: [],
      paymentMethods: [],
      activeCategory: 'all',
      searchQuery: '',
      setSession: (session) => set({ currentSession: session }),
      setTable: (table) => set({ currentTable: table }),
      addToCart: (product) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(
          (item) => item.product_id === product.id && item.variant_id === product.variant_id
        );

        if (existingItemIndex >= 0) {
          const newCart = [...cart];
          newCart[existingItemIndex].quantity += 1;
          set({ cart: newCart });
        } else {
          set({
            cart: [...cart, { ...product, id: generateId(), quantity: 1, product_id: product.id }],
          });
        }
      },
      removeFromCart: (itemId) => {
        set({ cart: get().cart.filter((item) => item.id !== itemId) });
      },
      updateCartItemQty: (itemId, qty) => {
        set({
          cart: get().cart.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item)),
        });
      },
      clearCart: () => set({ cart: [] }),
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'pos-state',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
