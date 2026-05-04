'use client';


const categoryColors = {
  
  'Beverage': {
    selected: 'bg-gradient-to-r from-sky-500 to-cyan-600',
    hover: 'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300',
    border: 'border-sky-200'
  },
  'Food': {
    selected: 'bg-gradient-to-r from-amber-500 to-orange-600',
    hover: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300',
    border: 'border-amber-200'
  },
  'Dessert': {
    selected: 'bg-gradient-to-r from-pink-500 to-rose-600',
    hover: 'hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300',
    border: 'border-pink-200'
  },
  'Snack': {
    selected: 'bg-gradient-to-r from-violet-500 to-purple-600',
    hover: 'hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300',
    border: 'border-violet-200'
  },
  
  'Beverages': {
    selected: 'bg-gradient-to-r from-sky-500 to-cyan-600',
    hover: 'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300',
    border: 'border-sky-200'
  },
  'Desserts': {
    selected: 'bg-gradient-to-r from-pink-500 to-rose-600',
    hover: 'hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300',
    border: 'border-pink-200'
  },
  'Snacks': {
    selected: 'bg-gradient-to-r from-violet-500 to-purple-600',
    hover: 'hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300',
    border: 'border-violet-200'
  }
};

const defaultColors = {
  selected: 'bg-gradient-to-r from-slate-500 to-slate-600',
  hover: 'hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300',
  border: 'border-slate-200'
};

const getCategoryColors = (categoryName) => {
  return categoryColors[categoryName] || defaultColors;
};

export default function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 shadow-md ${
          selectedCategory === null
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
            : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 hover:shadow-lg'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const colors = getCategoryColors(category.name);
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 shadow-md ${
              selectedCategory === category.id
                ? `${colors.selected} text-white shadow-lg scale-105`
                : `bg-white text-gray-700 border ${colors.border} ${colors.hover} hover:shadow-lg`
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

