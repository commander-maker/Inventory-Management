import React, { useState } from 'react';
import { Search, Eye, Edit2, Plus, Download, X } from 'lucide-react';

export default function InventoryList() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModal, setViewModal] = useState({ isOpen: false, product: null });
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });
  const [addModal, setAddModal] = useState(false);
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

  // Sample inventory data
  const inventoryStats = [
    { label: 'Total Products', value: '10', icon: '📦' },
    { label: 'Total Value', value: '₹183,950', icon: '💹' },
    { label: 'Low Stock Items', value: '2', icon: '⚠️' },
    { label: 'Categories', value: '5', icon: '📂' }
  ];

  const products = [
    {
      id: 1,
      name: 'Pepsi 300ml',
      category: 'Soft Drinks',
      stock: 8,
      unit: 'cases',
      price: 1500,
      value: 12000,
      supplier: 'PepsiCo Distributors',
      status: 'Low Stock',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      name: 'Coca Cola 300ml',
      category: 'Soft Drinks',
      stock: 45,
      unit: 'cases',
      price: 820,
      value: 36900,
      supplier: 'Coca Cola Company',
      status: 'In Stock',
      statusColor: 'bg-gray-900 text-white'
    },
    {
      id: 3,
      name: 'Red Bull 250ml',
      category: 'Energy Drinks',
      stock: 30,
      unit: 'cases',
      price: 1200,
      value: 36000,
      supplier: 'Red Bull Distribution',
      status: 'In Stock',
      statusColor: 'bg-gray-900 text-white'
    },
    {
      id: 4,
      name: 'Tropicana Orange 1L',
      category: 'Juices',
      stock: 5,
      unit: 'cases',
      price: 800,
      value: 4000,
      supplier: 'PepsiCo Distributors',
      status: 'Low Stock',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 5,
      name: 'Mountain Dew 500ml',
      category: 'Soft Drinks',
      stock: 25,
      unit: 'cases',
      price: 600,
      value: 15000,
      supplier: 'PepsiCo Distributors',
      status: 'In Stock',
      statusColor: 'bg-gray-900 text-white'
    },
    {
      id: 6,
      name: 'Sprite 300ml',
      category: 'Soft Drinks',
      stock: 12,
      unit: 'cases',
      price: 480,
      value: 5760,
      supplier: 'Coca Cola Company',
      status: 'In Stock',
      statusColor: 'bg-gray-900 text-white'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClick = (product) => {
    setViewModal({ isOpen: true, product });
  };

  const handleEditClick = (product) => {
    setEditFormData({ ...product });
    setEditModal({ isOpen: true, product });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: isNaN(value) ? value : Number(value) }));
  };

  const handleSaveEdit = () => {
    // Here you would send the updated data to your backend
    console.log('Saving product:', editFormData);
    setEditModal({ isOpen: false, product: null });
  };

  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProductForm(prev => ({ 
      ...prev, 
      [name]: isNaN(value) ? value : Number(value) 
    }));
  };

  const handleAddProduct = () => {
    // Here you would send the new product to your backend
    console.log('Adding new product:', newProductForm);
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
            <option>All Categories</option>
            <option>Soft Drinks</option>
            <option>Energy Drinks</option>
            <option>Juices</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              {/* Status Badge */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.statusColor}`}>
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
                    <p className="text-lg font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                  </div>
                  {/* Value */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Value</p>
                    <p className="text-lg font-semibold text-gray-900">₹{product.value.toLocaleString()}</p>
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
              </div>
            </div>
          ))}
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
                  <p className="text-gray-900">₹{viewModal.product.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                  <p className="text-gray-900">₹{viewModal.product.value.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewModal.product.statusColor}`}>
                    {viewModal.product.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <p className="text-gray-900">{viewModal.product.supplier}</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
                    value={editFormData.stock || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={editFormData.price || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
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
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Save Changes
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={newProductForm.stock}
                    onChange={handleAddProductChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
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
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹) *</label>
                <input 
                  type="number" 
                  name="price"
                  value={newProductForm.price}
                  onChange={handleAddProductChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
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
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}