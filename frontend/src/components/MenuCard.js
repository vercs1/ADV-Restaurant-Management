'use client';


const categoryColors = {
  'Beverage': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  'Beverages': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  'Food': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'Dessert': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  'Desserts': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  'Snack': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
  'Snacks': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
};

const getCategoryColors = (categoryName) => {
  return categoryColors[categoryName] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
};

export default function MenuCard({ menu, onAddToCart }) {
  const handleAdd = () => {
    if (menu.is_available && onAddToCart) {
      onAddToCart(menu);
    }
  };

  const catColors = getCategoryColors(menu.category_name);

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!menu.is_available ? 'opacity-60' : ''}`}>
      {menu.image_url ? (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          <img 
            src={menu.image_url} 
            alt={menu.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <span className="text-6xl">🍽️</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 flex-1">{menu.name}</h3>
          <span className="text-xl font-bold text-green-600 ml-2">₱{parseFloat(menu.price).toFixed(2)}</span>
        </div>
        {menu.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{menu.description}</p>
        )}
        {menu.category_name && (
          <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 border ${catColors.bg} ${catColors.text} ${catColors.border}`}>
            {menu.category_name}
          </span>
        )}
        <button
          onClick={handleAdd}
          disabled={!menu.is_available}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md ${
            menu.is_available
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white active:scale-95 hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {menu.is_available ? '➕ Add to Cart' : '❌ Unavailable'}
        </button>
      </div>
    </div>
  );
}

