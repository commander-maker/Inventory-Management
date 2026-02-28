import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, User, ChevronDown } from 'lucide-react';
import { customerAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const emptyForm = {
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    businessType: 'Retail',
    status: 'Active',
    notes: '',
    distance: ''
};

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterBusinessType, setFilterBusinessType] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerAPI.getAll();
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingCustomer) {
                await customerAPI.update(editingCustomer.id, formData);
                toast.success('Customer updated successfully');
            } else {
                await customerAPI.create(formData);
                toast.success('Customer created successfully');
            }
            setShowModal(false);
            setEditingCustomer(null);
            setFormData(emptyForm);
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            shopName: customer.shopName || '',
            ownerName: customer.ownerName || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            city: customer.city || '',
            area: customer.area || '',
            businessType: customer.businessType || 'Retail',
            status: customer.status || 'Active',
            notes: customer.notes || '',
            distance: customer.distance || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await customerAPI.delete(id);
            toast.success('Customer deleted successfully');
            setShowDeleteConfirm(null);
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete customer');
        }
    };

    const openAddModal = () => {
        setEditingCustomer(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.area.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
        const matchesType = filterBusinessType === 'All' || customer.businessType === filterBusinessType;

        return matchesSearch && matchesStatus && matchesType;
    });

    const statusColors = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-red-100 text-red-800',
        'On Hold': 'bg-yellow-100 text-yellow-800'
    };

    const businessTypes = ['Retail', 'Wholesale', 'Restaurant', 'Hotel', 'Supermarket', 'Other'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-4">
                    <div>
                        <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
                        <p className="text-xs xs:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your customer base and their details</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 xs:gap-2 bg-blue-600 text-white px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm xs:text-base"
                    >
                        <Plus size={20} />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1 xs:mb-2 md:mb-3">Total Customers</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg xs:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
                            <div className="p-2 xs:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <Store className="text-blue-500" size={28} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1 xs:mb-2 md:mb-3">Active</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg xs:text-2xl md:text-3xl font-bold text-green-600"> {customers.filter(c => c.status === 'Active').length}</p>
                            <div className="p-2 xs:p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <User className="text-green-500" size={28} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1 xs:mb-2 md:mb-3">Inactive</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg xs:text-2xl md:text-3xl font-bold text-red-600">{customers.filter(c => c.status === 'Inactive').length}</p>
                            <div className="p-2 xs:p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                                <User className="text-red-500" size={28} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1 xs:mb-2 md:mb-3">Total Deliveries</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg xs:text-2xl md:text-3xl font-bold text-purple-600">{customers.reduce((sum, c) => sum + (c._count?.DeliveryAssignment || 0), 0)}</p>
                            <div className="p-2 xs:p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <MapPin className="text-purple-500" size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="px-4 xs:px-5 md:px-8 pb-3 xs:pb-4">
                <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 items-stretch xs:items-center">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by shop name, owner, phone, city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 xs:py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm xs:text-base"
                        />
                    </div>
                    <div className="flex gap-2 xs:gap-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 xs:flex-none px-3 xs:px-4 py-2 xs:py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 text-sm xs:text-base"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                        <select
                            value={filterBusinessType}
                            onChange={(e) => setFilterBusinessType(e.target.value)}
                            className="flex-1 xs:flex-none px-3 xs:px-4 py-2 xs:py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 text-sm xs:text-base"
                        >
                            <option value="All">All Types</option>
                            {businessTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer Table / Cards */}
            <div className="px-4 xs:px-5 md:px-8 pb-4 xs:pb-6 md:pb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            Loading customers...
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                            <Store className="mx-auto mb-4 text-gray-300 dark:text-gray-700" size={48} />
                            <p className="text-lg font-medium">No customers found</p>
                            <p className="text-sm mt-1">Add your first customer to get started</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <table className="w-full hidden md:table">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Shop Name</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Owner</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Deliveries</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                        <Store className="text-blue-600 dark:text-blue-400" size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{customer.shopName}</p>
                                                        {customer.distance && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{Number(customer.distance).toFixed(1)} km away</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 dark:text-gray-200">{customer.ownerName}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                        <Phone size={14} />
                                                        {customer.phone}
                                                    </div>
                                                    {customer.email && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                            < Mail size={14} />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900 dark:text-gray-200">{customer.area}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{customer.city}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                                                    {customer.businessType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusColors[customer.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-gray-900 dark:text-gray-200 font-medium">{customer._count?.DeliveryAssignment || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(customer)}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                        title="Edit customer"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(customer.id)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                        title="Delete customer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredCustomers.map((customer) => (
                                    <div key={customer.id} className="p-3 xs:p-4">
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-2 mb-2 xs:mb-3">
                                            <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                                                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Store className="text-blue-600 dark:text-blue-400" size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm xs:text-base text-gray-900 dark:text-white truncate">{customer.shopName}</p>
                                                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">{customer.ownerName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-[10px] xs:text-xs font-semibold ${statusColors[customer.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {customer.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 xs:gap-y-2 text-xs xs:text-sm mb-2 xs:mb-3">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                <Phone size={12} className="flex-shrink-0" />
                                                <span className="truncate">{customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                <MapPin size={12} className="flex-shrink-0" />
                                                <span className="truncate">{customer.area}, {customer.city}</span>
                                            </div>
                                            <div>
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-[10px] xs:text-xs font-medium">
                                                    {customer.businessType}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                Deliveries: <span className="font-medium text-gray-900 dark:text-white">{customer._count?.DeliveryAssignment || 0}</span>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex gap-2 pt-2 xs:pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 xs:py-2 text-xs xs:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition font-medium"
                                            >
                                                <Edit2 size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(customer.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 xs:py-2 text-xs xs:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition font-medium"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-700 dark:text-gray-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 xs:p-5 md:p-6">
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name *</label>
                                    <input
                                        type="text"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name *</label>
                                    <input
                                        type="text"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="xs:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area *</label>
                                    <input
                                        type="text"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Type</label>
                                    <select
                                        value={formData.businessType}
                                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        {businessTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.distance}
                                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. 5.2"
                                    />
                                </div>
                                <div className="xs:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        rows={3}
                                        placeholder="Additional notes about this customer..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Customer</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this customer? This action cannot be undone and will also remove associated delivery records.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
