import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Plus, Download, X, Trash2 } from 'lucide-react';
import api, { inventoryAPI } from '../../utils/api'; // Import both
import { toast } from 'react-toastify';

export default function InventoryList() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModal, setViewModal] = useState({ isOpen: false, product: null });
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });
  const [addModal, setAddModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editFormData, setEditFormData] = useState({});
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Soft Drinks',
    stock: '',
    unit: 'cases',
    price: '',
    supplier: '',
    status: 'In Stock'
  });

  // Define all available categories
  const allCategories = ['Soft Drinks', 'Energy Drinks', 'Juices', 'Packaged Water', 'Others'];

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inventoryAPI.getAll(); // Use inventoryAPI
      setProducts(response.data.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch inventory';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from actual data
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);
  const lowStockItems = products.filter(p => p.status === 'Low Stock').length;
  const outOfStockItems = products.filter(p => p.status === 'Out of Stock').length;
  const categories = [...new Set(products.map(p => p.category))];

  const inventoryStats = [
    { label: 'Total Products', value: products.length.toString(), icon: '📦' },
    { label: 'Total Value', value: `Rs ${totalValue.toLocaleString()}`, icon: '💹' },
    { label: 'Low Stock', value: lowStockItems.toString(), icon: '⚠️' },
    { label: 'Out of Stock', value: outOfStockItems.toString(), icon: '❌' }
  ];

  // Enhanced search and filter function
  const filteredProducts = products.filter(product => {
    // Search matches product name, supplier, or category
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchLower) ||
      (product.supplier && product.supplier.toLowerCase().includes(searchLower)) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.status.toLowerCase().includes(searchLower);
    
    // Category filter
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewClick = (product) => {
    setViewModal({ isOpen: true, product });
  };

  const handleEditClick = (product) => {
    setEditFormData({ ...product });
    setEditModal({ isOpen: true, product });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.update(editFormData.id, editFormData);
      await fetchInventory();
      setEditModal({ isOpen: false, product: null });
      toast.success('Product updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      toast.error(errorMessage);
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!newProductForm.name || !newProductForm.stock || !newProductForm.price || !newProductForm.supplier) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      console.log('Adding product with data:', newProductForm);
      const response = await inventoryAPI.create(newProductForm);
      console.log('Product added successfully:', response.data);
      
      await fetchInventory();
      setAddModal(false);
      setNewProductForm({
        name: '',
        category: 'Soft Drinks',
        stock: '',
        unit: 'cases',
        price: '',
        supplier: '',
        status: 'In Stock'
      });
      toast.success('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add product';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await inventoryAPI.delete(id);
      await fetchInventory();
      toast.success('Product deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage and track your product inventory</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download size={18} />
                Export
              </button>
              <button 
                onClick={() => setAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          {inventoryStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <div className="flex justify-between items-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-8 py-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
          >
            <option value="All Categories">All Categories</option>
            {allCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-8 py-6">
        {loading && <p className="text-center text-gray-600">Loading inventory...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-32 h-32 mb-6 flex items-center justify-center">
              <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h16v16H4zm2-2h12v-2H6v2zm0-4h12v-2H6v2zm0-4h12V8H6v2z"/>
              </svg>
            </div>
            <p className="text-xl font-medium text-gray-600">No products found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
            <p className="text-xs text-gray-400 mt-8">
              Copyright © 2024 <span className="text-blue-600">AquaTrack</span> Design by Themesflat All rights reserved.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const value = Number(product.price) * product.stock;
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                {/* Status Badge */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>

                {/* Product Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Stock */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                      <p className="text-lg font-semibold text-gray-900">{product.stock} <span className="text-xs font-normal text-gray-500">{product.unit}</span></p>
                    </div>
                    {/* Price */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                      <p className="text-lg font-semibold text-gray-900">Rs {Number(product.price).toLocaleString()}</p>
                    </div>
                    {/* Value */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Value</p>
                      <p className="text-lg font-semibold text-gray-900">Rs {value.toLocaleString()}</p>
                    </div>
                    {/* Supplier */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">{product.supplier}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => handleViewClick(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Modal */}
      {viewModal.isOpen && viewModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">View Product</h2>
              <button 
                onClick={() => setViewModal({ isOpen: false, product: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <p className="text-gray-900 font-semibold">{viewModal.product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{viewModal.product.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <p className="text-gray-900">{viewModal.product.stock} {viewModal.product.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-gray-900">Rs {Number(viewModal.product.price).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                  <p className="text-gray-900">Rs {(Number(viewModal.product.price) * viewModal.product.stock).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewModal.product.status)}`}>
                    {viewModal.product.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <p className="text-gray-900">{viewModal.product.supplier}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{new Date(viewModal.product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex gap-3">
              <button 
                onClick={() => setViewModal({ isOpen: false, product: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button 
                onClick={() => setEditModal({ isOpen: false, product: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name </label>
                <input 
                  type="text" 
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category </label>
                <input 
                  type="text" 
                  name="category"
                  value={editFormData.category || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock ({editFormData.unit || 'cases'})</label>
                  <input 
                    type="number" 
                    name="stock"
                    min="0"
                    value={editFormData.stock || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs) </label>
                  <input 
                    type="number" 
                    name="price"
                    min="0"
                    step="0.01"
                    value={editFormData.price || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input 
                  type="text" 
                  name="unit"
                  value={editFormData.unit || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier </label>
                <input 
                  type="text" 
                  name="supplier"
                  value={editFormData.supplier || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status"
                  value={editFormData.status || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setEditModal({ isOpen: false, product: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button 
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name </label>
                <input 
                  type="text" 
                  name="name"
                  value={newProductForm.name}
                  onChange={handleAddProductChange}
                  placeholder="e.g., Pepsi 300ml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category </label>
                <select 
                  name="category"
                  value={newProductForm.category}
                  onChange={handleAddProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Soft Drinks">Soft Drinks</option>
                  <option value="Energy Drinks">Energy Drinks</option>
                  <option value="Juices">Juices</option>
                  <option value="Packaged Water">Packaged Water</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock </label>
                  <input 
                    type="number" 
                    name="stock"
                    min="0"
                    value={newProductForm.stock}
                    onChange={handleAddProductChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit </label>
                  <select 
                    name="unit"
                    value={newProductForm.unit}
                    onChange={handleAddProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="cases">Cases</option>
                    <option value="bottles">Bottles</option>
                    <option value="cartons">Cartons</option>
                    <option value="units">Units</option>
                    <option value="packs">Packs</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (Rs) </label>
                <input 
                  type="number" 
                  name="price"
                  min="0"
                  step="0.01"
                  value={newProductForm.price}
                  onChange={handleAddProductChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier </label>
                <input 
                  type="text" 
                  name="supplier"
                  value={newProductForm.supplier}
                  onChange={handleAddProductChange}
                  placeholder="e.g., PepsiCo Distributors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status </label>
                <select 
                  name="status"
                  value={newProductForm.status}
                  onChange={handleAddProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}