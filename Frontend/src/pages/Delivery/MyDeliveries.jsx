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
    AlertCircle
} from 'lucide-react';
import { deliveryAPI } from '../../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

export default function MyDeliveries() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [notes, setNotes] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pageSize, setPageSize] = useState('10');
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
        fetchMyDeliveries();
    }, []);

    const fetchMyDeliveries = async () => {
        try {
            setLoading(true);
            const response = await deliveryAPI.getMyDeliveries();
            if (response.data.success) {
                setDeliveries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (delivery, newStatus) => {
        setSelectedDelivery({ ...delivery, newStatus });
        setShowConfirmDialog(true);
    };

    const confirmStatusUpdate = async () => {
        try {
            setUpdating(true);
            setUpdateError(null);

            console.log('Updating delivery:', selectedDelivery.id, {
                status: selectedDelivery.newStatus,
                notes: notes
            });

            const response = await deliveryAPI.updateStatus(selectedDelivery.id, {
                status: selectedDelivery.newStatus,
                notes: notes
            });

            console.log('Update response:', response);

            if (response.data.success) {
                // Update local state
                setDeliveries(prev =>
                    prev.map(d =>
                        d.id === selectedDelivery.id ? response.data.data : d
                    )
                );
                setShowConfirmDialog(false);
                setNotes('');
                setSelectedDelivery(null);
                setUpdateError(null);
            } else {
                setUpdateError(response.data.message || 'Failed to update delivery');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update delivery status';
            setUpdateError(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-[#302617] dark:text-yellow-400 dark:border-[#69591f]';
            case 'In Transit':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#101c3a] dark:text-blue-400 dark:border-[#37507d]';
            case 'Delivered':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-[#142717] dark:text-green-400 dark:border-[#385d2e]';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-[#2f1417] dark:text-red-400 dark:border-[#7d343e]';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#171b2b] dark:text-gray-300 dark:border-[#384152]';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock size={18} className="text-yellow-600 dark:text-yellow-400" />;
            case 'In Transit':
                return <Truck size={18} className="text-blue-600 dark:text-blue-400" />;
            case 'Delivered':
                return <CheckCircle size={18} className="text-green-600 dark:text-green-400" />;
            case 'Failed':
                return <XCircle size={18} className="text-red-600 dark:text-red-400" />;
            default:
                return <Package size={18} className="text-gray-600 dark:text-gray-400" />;
        }
    };

    const filteredDeliveries = statusFilter === 'All'
        ? deliveries
        : deliveries.filter(d => d.status === statusFilter);
    const visibleDeliveries = pageSize === 'All'
        ? filteredDeliveries
        : filteredDeliveries.slice(0, Number(pageSize));

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'Pending').length,
        inTransit: deliveries.filter(d => d.status === 'In Transit').length,
        delivered: deliveries.filter(d => d.status === 'Delivered').length,
        failed: deliveries.filter(d => d.status === 'Failed').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm sticky top-0 z-10">
                <div className="px-4 sm:px-8 py-4 sm:py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        My Deliveries
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">View and update your assigned deliveries</p>
                </div>
            </div>

            <div className="px-4 sm:px-8 py-4 sm:py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <Package size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-[#2a2215] dark:to-[#382d17] rounded-xl shadow-sm border border-yellow-200 dark:border-[#69591f] p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mb-1">Pending</p>
                                <p className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pending}</p>
                            </div>
                            <Clock size={28} className="text-yellow-600 dark:text-yellow-400 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#111e3b] dark:to-[#17274f] rounded-xl shadow-sm border border-blue-200 dark:border-[#37507d] p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 mb-1">In Transit</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.inTransit}</p>
                            </div>
                            <Truck size={28} className="text-blue-600 dark:text-blue-400 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-[#122415] dark:to-[#17331c] rounded-xl shadow-sm border border-green-200 dark:border-[#385d2e] p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 mb-1">Delivered</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-200">{stats.delivered}</p>
                            </div>
                            <CheckCircle size={28} className="text-green-600 dark:text-green-400 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-[#2a1316] dark:to-[#38181d] rounded-xl shadow-sm border border-red-200 dark:border-[#7d343e] p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mb-1">Failed</p>
                                <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-200">{stats.failed}</p>
                            </div>
                            <XCircle size={28} className="text-red-600 dark:text-red-400 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 p-3 sm:p-4 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {['All', 'Pending', 'In Transit', 'Delivered', 'Failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition whitespace-nowrap ${statusFilter === status
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Showing <span className="font-semibold">{visibleDeliveries.length}</span> of{' '}
                            <span className="font-semibold">{filteredDeliveries.length}</span> matching deliveries
                        </p>
                        <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            Show
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="All">All</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/* Deliveries List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 sm:p-12 text-center">
                        <Package size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4 sm:w-16 sm:h-16" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Deliveries Found</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">You don't have any {statusFilter.toLowerCase()} deliveries.</p>
                    </div>
                ) : (
                    <div className="themed-list-scroll max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid gap-4">
                        {visibleDeliveries.map((delivery) => (
                            <div key={delivery.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-md transition">
                                <div className="flex flex-col lg:flex-row lg:items-center items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                                        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 border ${getStatusColor(delivery.status)}`}>
                                            {getStatusIcon(delivery.status)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{delivery.Customer?.shopName}</h3>
                                                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${getStatusColor(delivery.status)}`}>
                                                    {delivery.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <div className="flex items-start sm:items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <MapPin size={16} className="dark:text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <span>{delivery.Customer?.address}, {delivery.Customer?.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Phone size={16} className="dark:text-gray-400 flex-shrink-0" />
                                                    <span>{delivery.Customer?.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Package size={16} className="dark:text-gray-400 flex-shrink-0" />
                                                    <span>{delivery.productName} - {delivery.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Calendar size={16} className="dark:text-gray-400 flex-shrink-0" />
                                                    <span>{new Date(delivery.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {delivery.notes && (
                                                <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                                                    <span>{delivery.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {delivery.status !== 'Delivered' && (
                                        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
                                            {delivery.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(delivery, 'In Transit')}
                                                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Truck size={16} />
                                                    Start Delivery
                                                </button>
                                            )}
                                            {delivery.status === 'In Transit' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery, 'Delivered')}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Mark Delivered
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery, 'Failed')}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <XCircle size={16} />
                                                        Mark Failed
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {delivery.status === 'Delivered' && delivery.deliveredAt && (
                                        <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center justify-start lg:justify-end gap-2 w-full lg:w-auto mt-2 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
                                            <CheckCircle size={16} className="flex-shrink-0" />
                                            <span className="truncate">Delivered on {new Date(delivery.deliveredAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    title={`Confirm ${selectedDelivery?.newStatus}`}
                    message={
                        <div className="space-y-4">
                            {updateError && (
                                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-red-900 text-sm sm:text-base">Error</p>
                                        <p className="text-xs sm:text-sm text-red-800">{updateError}</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-sm sm:text-base">Are you sure you want to mark this delivery as <strong>{selectedDelivery?.newStatus}</strong>?</p>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about this delivery..."
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    rows={3}
                                    disabled={updating}
                                />
                            </div>
                        </div>
                    }
                    onConfirm={confirmStatusUpdate}
                    onClose={() => {
                        setShowConfirmDialog(false);
                        setNotes('');
                        setSelectedDelivery(null);
                        setUpdateError(null);
                    }}
                    confirmText={updating ? 'Updating...' : 'Confirm'}
                    cancelText="Cancel"
                />
            )}
        </div>
    );
}