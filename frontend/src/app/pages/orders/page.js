'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '../../../lib/api';
import OrderCard from '../../../components/OrderCard';
import StatusBadge from '../../../components/StatusBadge';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.update(orderId, { status: newStatus });
      await loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await orderAPI.delete(orderId);
      await loadOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.response?.data?.error || 'Failed to delete order.');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              POS Dashboard
            </Link>
            <Link
              href="/pages/menu-management"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Menu Management
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Show all orders
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="relative">
                <OrderCard
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700 text-sm font-medium"
                  title="Delete order"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statusOptions.slice(1).map((option) => {
                const count = orders.filter(o => o.status === option.value).length;
                return (
                  <div key={option.value} className="text-center">
                    <StatusBadge status={option.value} />
                    <p className="mt-2 text-2xl font-bold text-gray-800">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

