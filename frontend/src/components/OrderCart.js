'use client';

export default function OrderCart({ items, onUpdateQuantity, onRemoveItem, onCheckout, customerName, onCustomerNameChange }) {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  const total = subtotal;

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 h-full flex flex-col sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🛒</span>
        <h2 className="text-2xl font-bold text-gray-800">Current Order</h2>
      </div>

      <div className="mb-4">
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Enter customer name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-gray-500 font-medium">Cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id || `${item.menu_id}-${item.quantity}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.menu_name || item.name}</h4>
                    <p className="text-sm text-gray-600">₱{parseFloat(item.price).toFixed(2)} each</p>
                  </div>
                  <span className="font-bold text-green-600 text-lg">₱{parseFloat(item.subtotal || (item.price * item.quantity)).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item, Math.max(1, (item.quantity || 1) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">{item.quantity || 1}</span>
                  <button
                    onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 active:scale-95"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemoveItem(item)}
                    className="ml-auto px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t-2 border-gray-200 pt-4 mt-auto">
          <div className="flex justify-between items-center mb-4 p-3 bg-green-50 rounded-lg">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-green-600">₱{total.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3.5 rounded-lg text-lg font-bold transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
          >
            ✅ Checkout
          </button>
        </div>
      )}
    </div>
  );
}

