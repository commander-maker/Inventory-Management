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
                return <Clock size={18} />;
            case 'In Transit':
                return <Truck size={18} />;
            case 'Delivered':
                return <CheckCircle size={18} />;
            case 'Failed':
                return <XCircle size={18} />;
            default:
                return <Package size={18} />;
        }
    };

    const filteredDeliveries = statusFilter === 'All'
        ? deliveries
        : deliveries.filter(d => d.status === statusFilter);

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'Pending').length,
        inTransit: deliveries.filter(d => d.status === 'In Transit').length,
        delivered: deliveries.filter(d => d.status === 'Delivered').length,
        failed: deliveries.filter(d => d.status === 'Failed').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        My Deliveries
                    </h1>
                    <p className="text-gray-600 mt-1">View and update your assigned deliveries</p>
                </div>
            </div>

            <div className="px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Package size={32} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <Clock size={32} className="text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 mb-1">In Transit</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.inTransit}</p>
                            </div>
                            <Truck size={32} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 mb-1">Delivered</p>
                                <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
                            </div>
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 mb-1">Failed</p>
                                <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
                            </div>
                            <XCircle size={32} className="text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
                    <div className="flex gap-2">
                        {['All', 'Pending', 'In Transit', 'Delivered', 'Failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === status
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deliveries List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deliveries Found</h3>
                        <p className="text-gray-600">You don't have any {statusFilter.toLowerCase()} deliveries.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredDeliveries.map((delivery) => (
                            <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-lg ${getStatusColor(delivery.status).replace('text-', 'bg-').replace('100', '200')}`}>
                                            {getStatusIcon(delivery.status)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{delivery.Customer?.shopName}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                                                    {delivery.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin size={16} />
                                                    <span>{delivery.Customer?.address}, {delivery.Customer?.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone size={16} />
                                                    <span>{delivery.Customer?.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Package size={16} />
                                                    <span>{delivery.productName} - {delivery.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} />
                                                    <span>{new Date(delivery.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {delivery.notes && (
                                                <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                    <FileText size={16} className="mt-0.5" />
                                                    <span>{delivery.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {delivery.status !== 'Delivered' && (
                                        <div className="flex gap-2">
                                            {delivery.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(delivery, 'In Transit')}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                                >
                                                    <Truck size={16} />
                                                    Start Delivery
                                                </button>
                                            )}
                                            {delivery.status === 'In Transit' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery, 'Delivered')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Mark Delivered
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery, 'Failed')}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                                    >
                                                        <XCircle size={16} />
                                                        Mark Failed
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {delivery.status === 'Delivered' && delivery.deliveredAt && (
                                        <div className="text-sm text-green-600 flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            Delivered on {new Date(delivery.deliveredAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <ConfirmDialog
                    title={`Confirm ${selectedDelivery?.newStatus}`}
                    message={
                        <div className="space-y-4">
                            {updateError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-red-900">Error</p>
                                        <p className="text-sm text-red-800">{updateError}</p>
                                    </div>
                                </div>
                            )}
                            <p>Are you sure you want to mark this delivery as <strong>{selectedDelivery?.newStatus}</strong>?</p>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about this delivery..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    disabled={updating}
                                />
                            </div>
                        </div>
                    }
                    onConfirm={confirmStatusUpdate}
                    onCancel={() => {
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
