import React, { useState, useEffect } from 'react';
import { Package, Truck, TrendingUp, Clock, MapPin, Fuel, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI } from '../../utils/api';

export default function AgentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryStats, setDeliveryStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReportIssueModal, setShowReportIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({
        type: 'Vehicle',
        description: '',
        priority: 'Medium'
    });
    const [submittingIssue, setSubmittingIssue] = useState(false);

    // Fetch agent deliveries
    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                setLoading(true);
                const response = await deliveryAPI.getMyDeliveries();
                const deliveryData = response.data.data || [];
                setDeliveries(deliveryData);

                // Calculate statistics
                const stats = {
                    total: deliveryData.length,
                    completed: deliveryData.filter(d => d.status === 'Delivered').length,
                    inProgress: deliveryData.filter(d => d.status === 'In Transit').length,
                    pending: deliveryData.filter(d => d.status === 'Pending').length,
                    failed: deliveryData.filter(d => d.status === 'Failed').length
                };
                setDeliveryStats(stats);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch deliveries:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveries();
    }, []);

    // Quick Action Handlers
    const handleUpdateDelivery = () => {
        navigate('/my-deliveries');
    };

    const handleReportIssue = () => {
        setShowReportIssueModal(true);
    };

    const handleViewRoute = () => {
        navigate('/my-deliveries');
    };

    const handleViewSales = () => {
        navigate('/finance');
    };

    const handleSubmitIssue = async (e) => {
        e.preventDefault();
        setSubmittingIssue(true);
        
        try {
            // Here you would call an API to submit the issue
            // For now, we'll just simulate it
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reset form and close modal
            setIssueForm({
                type: 'Vehicle',
                description: '',
                priority: 'Medium'
            });
            setShowReportIssueModal(false);
            alert('Issue reported successfully!');
        } catch (err) {
            console.error('Failed to report issue:', err);
            alert('Failed to report issue. Please try again.');
        } finally {
            setSubmittingIssue(false);
        }
    };

    const handleCloseIssueModal = () => {
        setShowReportIssueModal(false);
        setIssueForm({
            type: 'Vehicle',
            description: '',
            priority: 'Medium'
        });
    };

    // Agent stats
    const agentStats = [
        { label: 'Assigned Vehicle', value: user?.vehicle || 'GJ-01-AB-1234', icon: Truck, color: 'text-blue-500', bgColor: 'bg-blue-100' },
        { label: 'Monthly Sales', value: `Rs ${Number(user?.monthlySales || 45000).toLocaleString()}`, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-100' },
        { label: 'Deliveries Today', value: deliveryStats.total.toString(), icon: Package, color: 'text-purple-500', bgColor: 'bg-purple-100' },
        { label: 'Completed Today', value: deliveryStats.completed.toString(), icon: CheckCircle, color: 'text-orange-500', bgColor: 'bg-orange-100' }
    ];

    // Vehicle status
    const vehicleStatus = {
        registrationNo: user?.vehicle || 'GJ-01-AB-1234',
        type: 'Tata Ace',
        fuelLevel: 75,
        location: 'Colombo 07',
        status: 'Active',
        lastService: '5 days ago'
    };

    // Get recent deliveries (last 5)
    const recentDeliveries = deliveries.slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Agent Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Agent'}!</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md">
                            <Clock size={20} />
                            <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-4 gap-6">
                    {agentStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                                <p className="text-gray-600 text-sm mb-3">{stat.label}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`${stat.color}`} size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-8 py-6 grid grid-cols-3 gap-6">

                {/* Today's Deliveries */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Today's Deliveries</h2>
                            <p className="text-gray-600 text-sm mt-1">Your scheduled deliveries for today</p>
                        </div>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                            {deliveryStats.total} Total
                        </span>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="py-8 text-center text-gray-500">Loading your deliveries...</div>
                        ) : error ? (
                            <div className="py-8 text-center text-red-600">Error loading deliveries: {error}</div>
                        ) : deliveries.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">No deliveries assigned yet</div>
                        ) : (
                            deliveries.map((delivery) => {
                                const statusColor = 
                                    delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                    delivery.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800';

                                return (
                                    <div
                                        key={delivery.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition group cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                                        {delivery.Customer?.ownerName || delivery.Customer?.shopName || 'Unknown Customer'}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                        {delivery.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        <span>{delivery.Customer?.address || 'No address'}</span>
                                                    </div>
                                                    {delivery.createdAt && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            <span>{new Date(delivery.createdAt).toLocaleTimeString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mt-2">
                                                    <span className="font-medium">Status:</span> {delivery.status}
                                                </p>
                                            </div>

                                            {delivery.status === 'Delivered' && (
                                                <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                                            )}
                                            {delivery.status === 'In Transit' && (
                                                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                            {delivery.status === 'Pending' && (
                                                <AlertCircle className="text-yellow-500 flex-shrink-0" size={24} />
                                            )}
                                            {delivery.status === 'Failed' && (
                                                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Vehicle Status & Performance */}
                <div className="space-y-6">
                    {/* Vehicle Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Vehicle Status</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Registration</span>
                                    <span className="font-semibold text-gray-900">{vehicleStatus.registrationNo}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <span className="font-medium text-gray-900">{vehicleStatus.type}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Location</span>
                                    <div className="flex items-center gap-1 text-gray-900">
                                        <MapPin size={14} className="text-blue-600" />
                                        <span className="font-medium">{vehicleStatus.location}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        {vehicleStatus.status}
                                    </span>
                                </div>
                            </div>

                            {/* Fuel Level */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Fuel size={14} />
                                        Fuel Level
                                    </span>
                                    <span className="font-semibold text-gray-900">{vehicleStatus.fuelLevel}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${vehicleStatus.fuelLevel}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500">
                                    Last Service: <span className="font-medium text-gray-700">{vehicleStatus.lastService}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock size={24} />
                            Recent Activity
                        </h2>

                        <div className="space-y-3">
                            {recentDeliveries.length > 0 ? (
                                recentDeliveries.map((delivery) => (
                                    <div key={delivery.id} className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-white">
                                                {delivery.Customer?.ownerName || delivery.Customer?.shopName || 'Unknown Customer'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                delivery.status === 'Delivered' ? 'bg-green-400 text-green-900' :
                                                delivery.status === 'In Transit' ? 'bg-blue-400 text-blue-900' :
                                                delivery.status === 'Pending' ? 'bg-yellow-400 text-yellow-900' :
                                                'bg-red-400 text-red-900'
                                            }`}>
                                                {delivery.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-blue-100">
                                            <MapPin size={12} />
                                            <span>{delivery.Customer?.address || 'No address'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm text-center">
                                    <p className="text-sm text-blue-100">No recent activity</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-blue-100 mb-1">Total Today</p>
                                    <p className="text-2xl font-bold">{deliveryStats.total}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-100 mb-1">Completed</p>
                                    <p className="text-2xl font-bold">{deliveryStats.completed}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-8 py-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>

                    <div className="grid grid-cols-4 gap-4">
                        <button 
                            onClick={handleUpdateDelivery}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
                        >
                            <Package className="text-gray-600 group-hover:text-blue-600 mb-3 transition" size={32} />
                            <span className="text-sm font-medium text-gray-900">Update Delivery</span>
                        </button>

                        <button 
                            onClick={handleReportIssue}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
                        >
                            <Truck className="text-gray-600 group-hover:text-blue-600 mb-3 transition" size={32} />
                            <span className="text-sm font-medium text-gray-900">Report Issue</span>
                        </button>

                        <button 
                            onClick={handleViewRoute}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
                        >
                            <MapPin className="text-gray-600 group-hover:text-blue-600 mb-3 transition" size={32} />
                            <span className="text-sm font-medium text-gray-900">View Route</span>
                        </button>

                        <button 
                            onClick={handleViewSales}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
                        >
                            <TrendingUp className="text-gray-600 group-hover:text-blue-600 mb-3 transition" size={32} />
                            <span className="text-sm font-medium text-gray-900">View Sales</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Issue Modal */}
            {showReportIssueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">Report an Issue</h3>
                            <button
                                onClick={handleCloseIssueModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitIssue} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Issue Type
                                </label>
                                <select
                                    value={issueForm.type}
                                    onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Vehicle">Vehicle Issue</option>
                                    <option value="Delivery">Delivery Issue</option>
                                    <option value="Customer">Customer Issue</option>
                                    <option value="Route">Route Issue</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={issueForm.priority}
                                    onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={issueForm.description}
                                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="4"
                                    placeholder="Describe the issue in detail..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseIssueModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                    disabled={submittingIssue}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    disabled={submittingIssue}
                                >
                                    {submittingIssue ? 'Submitting...' : 'Submit Issue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
