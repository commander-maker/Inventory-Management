import React, { useState, useEffect } from 'react';
import {
    Package,
    MapPin,
    Phone,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    User,
    Calendar,
    FileText,
    Search,
    Filter,
    RefreshCw,
    DollarSign,
    Plus,
    X,
    ShoppingCart
} from 'lucide-react';
import { deliveryAPI, vehicleAPI, customerAPI, inventoryAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminDeliveries() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Assign Delivery Modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [assignForm, setAssignForm] = useState({
        vehicleId: '',
        customerId: '',
        productName: '',
        quantity: '',
        unitPrice: '',
        totalAmount: '',
        notes: ''
    });

    useEffect(() => {
        fetchAllDeliveries();
    }, []);

    const fetchAllDeliveries = async () => {
        try {
            setLoading(true);
            const response = await deliveryAPI.getAll();
            if (response.data.success) {
                setDeliveries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormData = async () => {
        try {
            const [vehiclesRes, customersRes, inventoryRes] = await Promise.all([
                vehicleAPI.getAll(),
                customerAPI.getAll(),
                inventoryAPI.getAll()
            ]);
            if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
            if (customersRes.data.success) setCustomers(customersRes.data.data);
            if (inventoryRes.data.success) setInventory(inventoryRes.data.data);
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };

    const handleOpenAssignModal = () => {
        fetchFormData();
        setAssignForm({
            vehicleId: '',
            customerId: '',
            productName: '',
            quantity: '',
            unitPrice: '',
            totalAmount: '',
            notes: ''
        });
        setShowAssignModal(true);
    };

    const handleProductChange = (productName) => {
        const product = inventory.find(p => p.name === productName);
        const unitPrice = product ? parseFloat(product.price) : '';
        const quantity = assignForm.quantity;
        const totalAmount = unitPrice && quantity ? (unitPrice * parseFloat(quantity)).toFixed(2) : '';
        setAssignForm(prev => ({
            ...prev,
            productName,
            unitPrice: unitPrice.toString(),
            totalAmount
        }));
    };

    const handleQuantityChange = (quantity) => {
        const unitPrice = assignForm.unitPrice;
        const totalAmount = unitPrice && quantity ? (parseFloat(unitPrice) * parseFloat(quantity)).toFixed(2) : '';
        setAssignForm(prev => ({
            ...prev,
            quantity,
            totalAmount
        }));
    };

    const handleAssignDelivery = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await deliveryAPI.create({
                vehicleId: assignForm.vehicleId,
                customerId: parseInt(assignForm.customerId),
                productName: assignForm.productName,
                quantity: assignForm.quantity,
                unitPrice: assignForm.unitPrice ? parseFloat(assignForm.unitPrice) : null,
                totalAmount: assignForm.totalAmount ? parseFloat(assignForm.totalAmount) : null,
                notes: assignForm.notes || null
            });

            if (response.data.success) {
                toast.success('Delivery assigned successfully! Agent will see it in their dashboard.');
                setShowAssignModal(false);
                fetchAllDeliveries();
            }
        } catch (error) {
            console.error('Error assigning delivery:', error);
            toast.error(error.response?.data?.message || 'Failed to assign delivery');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Transit':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock size={16} />;
            case 'In Transit':
                return <Truck size={16} />;
            case 'Delivered':
                return <CheckCircle size={16} />;
            case 'Failed':
                return <XCircle size={16} />;
            default:
                return <Package size={16} />;
        }
    };

    // Get unique agents from deliveries
    const agents = [...new Map(
        deliveries
            .filter(d => d.Vehicle?.driver)
            .map(d => [d.Vehicle.driver.id, d.Vehicle.driver])
    ).values()];

    // Filter deliveries
    const filteredDeliveries = deliveries.filter(d => {
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        const matchesAgent = agentFilter === 'All' || d.Vehicle?.driver?.id === parseInt(agentFilter);
        const matchesSearch = searchTerm === '' ||
            d.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.Customer?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.Vehicle?.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesAgent && matchesSearch;
    });

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'Pending').length,
        inTransit: deliveries.filter(d => d.status === 'In Transit').length,
        delivered: deliveries.filter(d => d.status === 'Delivered').length,
        failed: deliveries.filter(d => d.status === 'Failed').length
    };

    const totalRevenue = deliveries
        .filter(d => d.status === 'Delivered')
        .reduce((sum, d) => sum + (parseFloat(d.totalAmount) || 0), 0);

    // Vehicles with assigned drivers
    const vehiclesWithDrivers = vehicles.filter(v => v.driver);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm sticky top-0 z-10">
                <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6 flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
                    <div>
                        <h1 className="text-xl xs:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Delivery Management
                        </h1>
                        <p className="text-xs xs:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Assign deliveries to agents and monitor all delivery activities</p>
                    </div>
                    <div className="flex gap-2 xs:gap-3">
                        <button
                            onClick={fetchAllDeliveries}
                            className="px-3 xs:px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1.5 xs:gap-2 text-sm xs:text-base"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button
                            onClick={handleOpenAssignModal}
                            className="px-3 xs:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 xs:gap-2 shadow-md text-sm xs:text-base"
                        >
                            <Plus size={16} />
                            Assign Delivery
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 xs:gap-3 md:gap-4 mb-4 xs:mb-5 md:mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                                <p className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <Package size={28} className="text-gray-400 dark:text-gray-600 hidden xs:block" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-yellow-700 mb-1">Pending</p>
                                <p className="text-lg xs:text-xl md:text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <Clock size={28} className="text-yellow-600 hidden xs:block" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-blue-700 mb-1">In Transit</p>
                                <p className="text-lg xs:text-xl md:text-2xl font-bold text-blue-900">{stats.inTransit}</p>
                            </div>
                            <Truck size={28} className="text-blue-600 hidden xs:block" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-green-700 mb-1">Delivered</p>
                                <p className="text-lg xs:text-xl md:text-2xl font-bold text-green-900">{stats.delivered}</p>
                            </div>
                            <CheckCircle size={28} className="text-green-600 hidden xs:block" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-red-700 mb-1">Failed</p>
                                <p className="text-lg xs:text-xl md:text-2xl font-bold text-red-900">{stats.failed}</p>
                            </div>
                            <XCircle size={28} className="text-red-600 hidden xs:block" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-200 p-3 xs:p-4 md:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs xs:text-sm text-indigo-700 mb-1">Revenue</p>
                                <p className="text-sm xs:text-base md:text-lg font-bold text-indigo-900">LKR {totalRevenue.toLocaleString()}</p>
                            </div>
                            <DollarSign size={28} className="text-indigo-600 hidden xs:block" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4 xs:mb-5 md:mb-6 p-3 xs:p-4">
                    <div className="flex flex-col gap-3 xs:gap-4">
                        {/* Search */}
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by product, customer, or agent..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xs:text-base"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-1.5 xs:gap-2 flex-wrap">
                            {['All', 'Pending', 'In Transit', 'Delivered', 'Failed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-medium transition ${statusFilter === status
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Agent Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                            <select
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm"
                            >
                                <option value="All">All Agents</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Deliveries Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Deliveries Found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No deliveries match your current filters.</p>
                        <button
                            onClick={handleOpenAssignModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Assign New Delivery
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Agent</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredDeliveries.map((delivery) => (
                                        <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            {/* Agent */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {delivery.Vehicle?.driver?.name || 'Unassigned'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {delivery.Vehicle?.driver?.phone || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{delivery.Customer?.shopName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{delivery.Customer?.city}</p>
                                            </td>

                                            {/* Product */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900 dark:text-gray-200">{delivery.productName}</p>
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.quantity}</p>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {delivery.totalAmount ? `LKR ${parseFloat(delivery.totalAmount).toLocaleString()}` : '—'}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                                                    {getStatusIcon(delivery.status)}
                                                    {delivery.status}
                                                </span>
                                            </td>

                                            {/* Vehicle */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.vehicleId}</p>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm text-gray-900 dark:text-gray-200">
                                                        {new Date(delivery.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {delivery.status === 'Delivered' && delivery.deliveredAt && (
                                                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                                            <CheckCircle size={12} />
                                                            {new Date(delivery.deliveredAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredDeliveries.map((delivery) => (
                                <div key={delivery.id} className="p-3 xs:p-4">
                                    {/* Card Header: Agent + Status */}
                                    <div className="flex items-start justify-between gap-2 mb-2 xs:mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 xs:w-8 xs:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User size={12} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-xs xs:text-sm truncate">
                                                    {delivery.Vehicle?.driver?.name || 'Unassigned'}
                                                </p>
                                                <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400">
                                                    {delivery.Vehicle?.driver?.phone || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-semibold border flex-shrink-0 ${getStatusColor(delivery.status)}`}>
                                            {getStatusIcon(delivery.status)}
                                            {delivery.status}
                                        </span>
                                    </div>

                                    {/* Card Details */}
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 xs:gap-y-2 text-xs xs:text-sm">
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Customer</p>
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{delivery.Customer?.shopName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Product</p>
                                            <p className="text-gray-900 dark:text-gray-200 truncate">{delivery.productName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Qty</p>
                                            <p className="text-gray-700 dark:text-gray-300">{delivery.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Amount</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {delivery.totalAmount ? `LKR ${parseFloat(delivery.totalAmount).toLocaleString()}` : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Vehicle</p>
                                            <p className="text-gray-700 dark:text-gray-300">{delivery.vehicleId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 uppercase">Date</p>
                                            <p className="text-gray-900 dark:text-gray-200">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table Footer */}
                        <div className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-semibold">{filteredDeliveries.length}</span> of{' '}
                                <span className="font-semibold">{deliveries.length}</span> deliveries
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Assign Delivery Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-white">Assign Delivery</h3>
                                <p className="text-blue-100 text-sm mt-1">Assign products to an agent for customer delivery</p>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAssignDelivery} className="p-6 space-y-5">

                            {/* Step 1: Select Vehicle (Agent) */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                    <Truck size={16} />
                                    Step 1: Select Vehicle & Agent
                                </p>
                                <select
                                    value={assignForm.vehicleId}
                                    onChange={(e) => setAssignForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Vehicle (with agent)</option>
                                    {vehiclesWithDrivers.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.id} - {v.vehicleType} → Agent: {v.driver.name}
                                        </option>
                                    ))}
                                    {vehicles.filter(v => !v.driver).length > 0 && (
                                        <optgroup label="⚠ Vehicles without Agent (cannot assign)">
                                            {vehicles.filter(v => !v.driver).map(v => (
                                                <option key={v.id} value={v.id} disabled>
                                                    {v.id} - {v.vehicleType} (No agent assigned)
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                {assignForm.vehicleId && vehiclesWithDrivers.find(v => v.id === assignForm.vehicleId) && (
                                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <span className="font-semibold">Agent:</span>{' '}
                                            {vehiclesWithDrivers.find(v => v.id === assignForm.vehicleId)?.driver?.name}{' '}
                                            · <span className="font-semibold">Phone:</span>{' '}
                                            {vehiclesWithDrivers.find(v => v.id === assignForm.vehicleId)?.driver?.phone}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Select Customer */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                    <MapPin size={16} />
                                    Step 2: Select Customer (Shop)
                                </p>
                                <select
                                    value={assignForm.customerId}
                                    onChange={(e) => setAssignForm(prev => ({ ...prev, customerId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-green-300 dark:border-green-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.shopName} — {c.ownerName} ({c.city}, {c.area})
                                        </option>
                                    ))}
                                </select>
                                {assignForm.customerId && (
                                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-900">
                                        {(() => {
                                            const c = customers.find(c => c.id === parseInt(assignForm.customerId));
                                            return c ? (
                                                <p className="text-xs text-green-700 dark:text-green-300">
                                                    <span className="font-semibold">Address:</span> {c.address}, {c.city}{' '}
                                                    · <span className="font-semibold">Phone:</span> {c.phone}
                                                </p>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Product Details */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
                                <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                                    <ShoppingCart size={16} />
                                    Step 3: Product & Quantity
                                </p>

                                {/* Product */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Product</label>
                                    <select
                                        value={assignForm.productName}
                                        onChange={(e) => handleProductChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Product from Inventory</option>
                                        {inventory.map(p => (
                                            <option key={p.id} value={p.name}>
                                                {p.name} — Stock: {p.stock} {p.unit} — LKR {parseFloat(p.price).toLocaleString()}/{p.unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Quantity</label>
                                    <input
                                        type="text"
                                        value={assignForm.quantity}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        placeholder="e.g. 50 Bottles, 10 Cases"
                                        className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Unit Price & Total */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Unit Price (LKR)</label>
                                        <input
                                            type="number"
                                            value={assignForm.unitPrice}
                                            onChange={(e) => {
                                                const unitPrice = e.target.value;
                                                const qty = parseFloat(assignForm.quantity) || 0;
                                                setAssignForm(prev => ({
                                                    ...prev,
                                                    unitPrice,
                                                    totalAmount: unitPrice && qty ? (parseFloat(unitPrice) * qty).toFixed(2) : ''
                                                }));
                                            }}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Total Amount (LKR)</label>
                                        <input
                                            type="number"
                                            value={assignForm.totalAmount}
                                            onChange={(e) => setAssignForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                                            placeholder="Auto-calculated"
                                            className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-100 dark:bg-purple-900/30 dark:text-white font-semibold"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes / Instructions (Optional)</label>
                                <textarea
                                    value={assignForm.notes}
                                    onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="e.g. Deliver by 10 AM, collect payment on delivery, deliver on Monday..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Summary */}
                            {assignForm.vehicleId && assignForm.customerId && assignForm.productName && (
                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">📋 Assignment Summary</p>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <p>
                                            <span className="font-medium">Agent:</span>{' '}
                                            {vehiclesWithDrivers.find(v => v.id === assignForm.vehicleId)?.driver?.name || '—'}
                                            {' → '}
                                            <span className="font-medium">Vehicle:</span> {assignForm.vehicleId}
                                        </p>
                                        <p>
                                            <span className="font-medium">Will deliver:</span>{' '}
                                            {assignForm.quantity} of {assignForm.productName}
                                        </p>
                                        <p>
                                            <span className="font-medium">To:</span>{' '}
                                            {customers.find(c => c.id === parseInt(assignForm.customerId))?.shopName || '—'}
                                        </p>
                                        {assignForm.totalAmount && (
                                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                                Total: LKR {parseFloat(assignForm.totalAmount).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-2 border-t dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Assign Delivery
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
