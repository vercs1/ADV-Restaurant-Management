'use client';

import StatusBadge from './StatusBadge';

export default function OrderCard({ order, onStatusUpdate }) {
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (onStatusUpdate && newStatus !== order.status) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">{order.customer_name}</p>
          {order.customer_phone && (
            <p className="text-sm text-gray-500">{order.customer_phone}</p>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mb-4">
          <ul className="space-y-1">
            {order.items.slice(0, 3).map((item, idx) => (
              <li key={idx} className="text-sm text-gray-600">
                {item.quantity}x {item.menu_name || item.name}
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-sm text-gray-500">+{order.items.length - 3} more items</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
        <span className="text-lg font-bold text-green-600">₱{parseFloat(order.total_amount).toFixed(2)}</span>
      </div>

      <select
        value={order.status}
        onChange={handleStatusChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}

