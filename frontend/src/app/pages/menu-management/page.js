'use client';

import { useState, useEffect } from 'react';
import { menuAPI } from '../../../lib/api';
import Link from 'next/link';


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

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menusRes, categoriesRes] = await Promise.all([
        menuAPI.getAll(),
        menuAPI.getCategories()
      ]);
      setMenus(menusRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await menuAPI.update(editingMenu.id, formData);
      } else {
        await menuAPI.create(formData);
      }
      await loadData();
      resetForm();
      alert(`Menu item ${editingMenu ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert(err.response?.data?.error || 'Failed to save menu item.');
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name || '',
      description: menu.description || '',
      price: menu.price || '',
      category_id: menu.category_id || '',
      image_url: menu.image_url || '',
      is_available: menu.is_available !== undefined ? menu.is_available : true
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await menuAPI.delete(id);
      await loadData();
      alert('Menu item deleted successfully!');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert(err.response?.data?.error || 'Failed to delete menu item.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    });
    setEditingMenu(null);
    setShowForm(false);
  };

  const toggleAvailability = async (menu) => {
    try {
      await menuAPI.update(menu.id, { is_available: !menu.is_available });
      await loadData();
    } catch (err) {
      console.error('Error updating availability:', err);
      alert(err.response?.data?.error || 'Failed to update availability.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              POS Dashboard
            </Link>
            <Link
              href="/pages/orders"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Orders
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {showForm ? 'Cancel' : '+ Add Menu Item'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_available" className="ml-2 text-sm font-medium text-gray-700">
                  Available
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingMenu ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No menu items found</p>
            </div>
          ) : (
            menus.map((menu) => (
              <div
                key={menu.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  !menu.is_available ? 'opacity-60' : ''
                }`}
              >
                {menu.image_url && (
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{menu.name}</h3>
                    <span className="text-lg font-bold text-green-600">
                      ₱{parseFloat(menu.price).toFixed(2)}
                    </span>
                  </div>
                  {menu.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{menu.description}</p>
                  )}
                  {menu.category_name && (
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 border ${getCategoryColors(menu.category_name).bg} ${getCategoryColors(menu.category_name).text} ${getCategoryColors(menu.category_name).border}`}>
                      {menu.category_name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        menu.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {menu.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleAvailability(menu)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        menu.is_available
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {menu.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

