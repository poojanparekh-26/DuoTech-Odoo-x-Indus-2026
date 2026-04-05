// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/customer/CustomerDisplayPage.jsx
import React, { useEffect, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CustomerDisplayPage = () => {
  const { fetchProducts, products, loading: productsLoading } = useProducts();
  
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchProducts().then(prods => {
      if (prods) {
        setFilteredProducts(prods);
        const uniqueCategories = [...new Set(prods.map(p => p.category))].filter(Boolean);
        setCategories(['all', ...uniqueCategories]);
      }
    });
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleUpdateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, qty } : item
      ));
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (cart.length === 0) {
      alert('Please add items to your order');
      return;
    }

    setOrderLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.qty,
        price: item.price,
      }));

      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      // Use the public customer-orders API endpoint
      const response = await fetch('/api/customer-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email || null,
          customer_phone: customerInfo.phone || null,
          items: orderItems,
          total: total,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      const data = await response.json();
      setOrderId(data.data.id);
      setOrderPlaced(true);
    } catch (err) {
      alert('Error placing order: ' + err.message);
      console.error('Error placing order:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Success screen
  if (orderPlaced) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-scale-in">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">Order Placed!</h1>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto text-lg">Your order has been successfully sent to the kitchen.</p>
        
        <div className="bg-gray-800 border-2 border-amber-500 rounded-2xl py-8 px-12 mb-8 shadow-lg">
          <span className="text-gray-400 text-xs uppercase tracking-widest block mb-3 font-medium">Order Number</span>
          <span className="text-amber-500 text-6xl font-bold font-mono tracking-wider">{orderId?.slice(0, 8).toUpperCase() || '####'}</span>
        </div>

        <p className="text-amber-500/80 animate-pulse text-lg tracking-widest font-mono">Your order is being prepared...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 pb-32">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-amber-500 font-serif italic">Odoo Cafe</h1>
          <p className="text-gray-400 text-sm">Create Your Custom Order</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Menu Section */}
          <div className="lg:col-span-2">
            {/* Customer Info Form */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Name *"
                  placeholder="Your name"
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  className="text-white"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                />
                <Input
                  label="Phone"
                  placeholder="+1234567890"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-lg">No products available in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-amber-500 transition-all hover:shadow-[0_0_20px_rgba(217,119,6,0.2)]"
                  >
                    <div className="p-4">
                      <h3 className="text-gray-100 font-bold text-lg line-clamp-2 mb-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                        {product.description || 'Premium quality item'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-500 font-bold text-xl">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4">
                <h3 className="text-white font-bold text-lg">
                  Order Summary
                </h3>
                <p className="text-amber-100 text-sm">{cartCount} items in cart</p>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="bg-gray-700 rounded-lg p-3 flex justify-between items-start border border-gray-600"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-100 text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-amber-500 font-bold text-sm">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                            className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded text-sm font-bold"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-white font-bold">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                            className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded text-sm font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="bg-red-600 hover:bg-red-500 text-white w-6 h-6 rounded text-sm ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 p-4 space-y-3">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Tax (10%):</span>
                  <span>${(cartTotal * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between items-center text-lg">
                  <span className="font-bold text-white">Total:</span>
                  <span className="text-amber-500 font-bold text-xl">
                    ${(cartTotal * 1.1).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || cart.length === 0}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </Button>

                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
