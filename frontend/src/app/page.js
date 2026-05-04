'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { menuAPI, orderAPI } from '../lib/api';
import MenuCard from '../components/MenuCard';
import OrderCart from '../components/OrderCart';
import CategoryTabs from '../components/CategoryTabs';

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menusRes, categoriesRes] = await Promise.all([
        menuAPI.getAll({ available_only: 'true' }),
        menuAPI.getCategories()
      ]);
      setMenus(menusRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      if (err.response?.status === 404) {
        setError('Backend server not found. Make sure the backend is running on http://localhost:5000');
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Please start the backend server first.');
      } else {
        setError(err.response?.data?.error || 'Failed to load menu items. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = selectedCategory
    ? menus.filter(menu => menu.category_id === selectedCategory)
    : menus;

  const handleAddToCart = (menu) => {
    const existingItem = cartItems.find(item => item.menu_id === menu.id);
    
    if (existingItem) {
      handleUpdateQuantity(existingItem, (existingItem.quantity || 1) + 1);
    } else {
      const newItem = {
        menu_id: menu.id,
        menu_name: menu.name,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        subtotal: parseFloat(menu.price)
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    const updatedItems = cartItems.map(cartItem => {
      if (cartItem.menu_id === item.menu_id) {
        const price = parseFloat(cartItem.price || item.price);
        return {
          ...cartItem,
          quantity: newQuantity,
          subtotal: price * newQuantity
        };
      }
      return cartItem;
    });
    setCartItems(updatedItems);
  };

  const handleRemoveItem = (item) => {
    setCartItems(cartItems.filter(cartItem => cartItem.menu_id !== item.menu_id));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Validate customer name
    const finalCustomerName = customerName.trim();
    if (!finalCustomerName) {
      alert('Please enter a customer name before checkout');
      return;
    }

    try {
      const orderData = {
        customer_name: finalCustomerName,
        items: cartItems.map(item => ({
          menu_id: parseInt(item.menu_id),
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price)
        }))
      };

      await orderAPI.create(orderData);
      alert('Order placed successfully!');
      setCartItems([]);
      setCustomerName('');
    } catch (err) {
      console.error('Error creating order:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create order. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Restaurant POS System</h1>
              <p className="text-gray-600">Point of Sale & Order Management</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pages/orders"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                📋 Orders
              </Link>
              <Link
                href="/pages/menu-management"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                🍽️ Menu Management
              </Link>
            </div>
          </div>
          {customerName && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Customer: <span className="font-semibold text-green-600">{customerName}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Menu Grid */}
        <div className="lg:col-span-3">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMenus.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl text-gray-500 font-medium">No menu items found</p>
                <p className="text-gray-400 mt-2">Add items in Menu Management to get started</p>
              </div>
            ) : (
              filteredMenus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column - Order Cart */}
        <div className="lg:col-span-1">
          <OrderCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
          />
        </div>
      </div>
    </main>
  );
}
