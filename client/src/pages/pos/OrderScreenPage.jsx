// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/pos/OrderScreenPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { CategoryTabs } from '../../components/pos/CategoryTabs';
import { ProductCard } from '../../components/pos/ProductCard';
import { CartItem } from '../../components/pos/CartItem';
import { NumberPad } from '../../components/pos/NumberPad';
import { OrderTotals } from '../../components/pos/OrderTotals';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { useOrders } from '../../hooks/useOrders';
import { useTables } from '../../hooks/useTables';

export const OrderScreenPage = () => {
  const { configId, tableId } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { createOrder } = useOrders();
  const { fetchTable } = useTables();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [table, setTable] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [numpadMode, setNumpadMode] = useState('qty');
  const [numpadValue, setNumpadValue] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (tableId !== 'takeaway') {
      fetchTable(tableId).then(setTable);
    }
  }, [fetchProducts, fetchCategories, fetchTable, tableId]);

  const displayProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category_id !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...product, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (id, q) => setCart(cart.map(i => i.id === id ? { ...i, quantity: q } : i));
  const removeItem = (id) => setCart(cart.filter(i => i.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const taxAmount = 0; // standard mock
  const total = subtotal + taxAmount;

  const handleCreateOrder = async (isPayment = false) => {
    const sessionId = localStorage.getItem('sessionId') || '90000000-0000-0000-0000-000000000001'; 
    const payload = {
      sessionId,
      tableId: tableId !== 'takeaway' ? tableId : null,
      orderType: tableId !== 'takeaway' ? 'DINE_IN' : 'TAKEAWAY',
      items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price }))
    };
    try {
      const order = await createOrder(payload);
      if (isPayment) {
        navigate(`/pos/${configId}/payment/${order.id}`);
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      
      {/* LEFT PANEL : PRODUCTS */}
      <div className="w-[65%] flex flex-col border-r border-gray-800 bg-gray-900 h-full">
        <div className="p-4 bg-gray-800/50 border-b border-gray-800 shrink-0 shadow-sm">
           <CategoryTabs 
             categories={categories || []} 
             activeCategory={activeCategory} 
             onSelect={setActiveCategory} 
           />
           <div className="mt-4 flex gap-4">
             <Input 
               placeholder="Search products..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="max-w-md"
               rightIcon={<span className="text-xl">🔍</span>}
             />
             <Button variant="ghost" onClick={() => {setSearch(''); setActiveCategory('all');}}>Reset</Button>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {displayProducts.length === 0 ? (
             <div className="h-full flex items-center justify-center text-gray-500 italic">No products found</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {displayProducts.map(p => (
                 <ProductCard key={p.id} product={p} onAdd={addToCart} />
               ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL : CART */}
      <div className="w-[35%] flex flex-col bg-gray-900 h-full">
        
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-widest uppercase">
              {tableId === 'takeaway' ? 'Takeaway' : (table ? `Table ${table.table_number}` : 'Loading...')}
            </h2>
            <p className="text-xs text-amber-500 font-mono">ORDER #1001</p>
          </div>
          <button onClick={() => navigate(`/pos/${configId}/floor`)} className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-white text-xl shadow">→</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-900">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 italic">Order is empty</div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-2 shadow-inner border border-gray-700">
              {cart.map(item => (
                <CartItem key={item.id} item={item} onQtyChange={updateQuantity} onRemove={removeItem} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-800 border-t border-gray-700 shrink-0 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="flex gap-2">
            <Input placeholder="👤 Customer" className="mb-2 w-1/2" />
            <Input placeholder="📝 Notes" className="mb-4 w-1/2" />
          </div>
          
          <NumberPad 
            value={numpadValue} 
            onChange={setNumpadValue} 
            mode={numpadMode} 
            onModeChange={setNumpadMode} 
          />
          
          <OrderTotals subtotal={subtotal} taxAmount={taxAmount} total={total} />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button className="h-14 font-bold text-lg !bg-blue-600 hover:!bg-blue-500 shadow-lg" onClick={() => handleCreateOrder(false)}>Send to Kitchen</Button>
            <Button 
              className="h-14 font-bold text-xl hover:brightness-110 shadow-lg !bg-amber-600" 
              onClick={() => handleCreateOrder(true)}
              disabled={cart.length === 0}
            >
              Payment
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};
