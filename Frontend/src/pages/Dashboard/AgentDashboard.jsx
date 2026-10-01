import React, { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    TrendingUp,
    Clock,
    MapPin,
    Fuel,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI, userAPI, vehicleAPI } from '../../utils/api';

export default function AgentDashboard() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [deliveries, setDeliveries] = useState([]);
    const [vehicle, setVehicle] = useState(null);
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
                    completed: deliveryData.filter(
                        d => d.status === 'Delivered'
                    ).length,
                    inProgress: deliveryData.filter(
                        d => d.status === 'In Transit'
                    ).length,
                    pending: deliveryData.filter(
                        d => d.status === 'Pending'
                    ).length,
                    failed: deliveryData.filter(
                        d => d.status === 'Failed'
                    ).length
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

    // Fetch agent assigned vehicle
    useEffect(() => {
        const fetchAssignedVehicle = async () => {
            try {
                const response = await vehicleAPI.getMyVehicle();
                if (response.data.success && response.data.data) {
                    setVehicle(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch assigned vehicle:', err);
            }
        };

        fetchAssignedVehicle();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const refreshAgentProfile = async () => {
            try {
                const response = await userAPI.getById(user.id);

                if (response.data.success && response.data.data) {
                    const updatedUser = response.data.data;

                    setUser(updatedUser);
                    localStorage.setItem(
                        'user',
                        JSON.stringify(updatedUser)
                    );
                }
            } catch (err) {
                console.error(
                    'Failed to refresh agent profile:',
                    err
                );
            }
        };

        refreshAgentProfile();
    }, [user?.id, setUser]);

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
        {
            label: 'Assigned Vehicle',
            value: vehicle?.id || user?.vehicle || 'None',
            icon: Truck,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100'
        },
        {
            label: 'Monthly Sales',
            value: `Rs ${Number(
                user?.monthlySales ?? 0
            ).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-green-500',
            bgColor: 'bg-green-100'
        },
        {
            label: 'Deliveries Today',
            value: deliveryStats.total.toString(),
            icon: Package,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100'
        },
        {
            label: 'Completed Today',
            value: deliveryStats.completed.toString(),
            icon: CheckCircle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100'
        }
    ];

    // Vehicle status
    const vehicleStatus = {
        registrationNo: vehicle?.id || user?.vehicle || 'Not Assigned',
        type: vehicle?.vehicleType || 'Standard',
        fuelLevel: vehicle?.fuelLevel !== undefined ? vehicle.fuelLevel : 0,
        location: vehicle?.location || 'Main warehouse',
        status: vehicle?.status || 'Active',
        lastService: vehicle?.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'Recent'
    };

    // Get recent deliveries
    const recentDeliveries = deliveries.slice(0, 5);

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* ================= HEADER ================= */}
            <div className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
                <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        {/* Title */}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:text-3xl">
                                Agent Dashboard
                            </h1>

                            <p className="mt-2 break-words text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                Welcome back, {user?.name || 'Agent'}!
                            </p>
                        </div>

                        {/* Date */}
                        <div className="flex w-full max-w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-3 text-white shadow-md sm:w-auto sm:min-w-[220px] sm:px-4 sm:py-2">
                            <Clock
                                size={18}
                                className="shrink-0 sm:h-5 sm:w-5"
                            />

                            <span className="text-center text-sm font-medium leading-5 sm:text-base">
                                {new Date().toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }
                                )}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* ================= STATS SECTION ================= */}
            <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">

                    {agentStats.map((stat, index) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={index}
                                className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-5 lg:p-6"
                            >
                                <p className="mb-3 break-words text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>

                                <div className="flex min-w-0 items-center justify-between gap-3">

                                    <p className="min-w-0 flex-1 break-all text-xl font-bold leading-tight text-gray-900 dark:text-white sm:text-2xl">
                                        {stat.value}
                                    </p>

                                    <div
                                        className={`shrink-0 rounded-lg p-2.5 ${stat.bgColor} dark:bg-opacity-20 sm:p-3`}
                                    >
                                        <Icon
                                            className={stat.color}
                                            size={22}
                                        />
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="grid w-full grid-cols-1 gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-3 lg:gap-6 lg:px-8">

                {/* ================= TODAY'S DELIVERIES ================= */}
                <div className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5 lg:col-span-2 lg:p-6">

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                                Today's Deliveries
                            </h2>

                            <p className="mt-1 break-words text-sm text-gray-600 dark:text-gray-400">
                                Your scheduled deliveries for today
                            </p>
                        </div>

                        <span className="w-fit shrink-0 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {deliveryStats.total} Total
                        </span>

                    </div>

                    <div className="space-y-3">

                        {loading ? (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading your deliveries...
                            </div>
                        ) : error ? (
                            <div className="break-words py-8 text-center text-red-600 dark:text-red-400">
                                Error loading deliveries: {error}
                            </div>
                        ) : deliveries.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No deliveries assigned yet
                            </div>
                        ) : (
                            deliveries.map((delivery) => {

                                const statusColor =
                                    delivery.status === 'Delivered'
                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-[#142717] dark:text-green-400 dark:border-[#385d2e]'
                                        : delivery.status === 'In Transit'
                                            ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#101c3a] dark:text-blue-400 dark:border-[#37507d]'
                                            : delivery.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-[#302617] dark:text-yellow-400 dark:border-[#69591f]'
                                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-[#2f1417] dark:text-red-400 dark:border-[#7d343e]';

                                return (
                                    <div
                                        key={delivery.id}
                                        className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-4"
                                    >

                                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                            <div className="min-w-0 flex-1">

                                                <div className="flex min-w-0 flex-wrap items-center gap-2 mb-2">

                                                    <h3 className="min-w-0 max-w-full break-words font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                        {delivery.Customer?.ownerName ||
                                                            delivery.Customer?.shopName ||
                                                            'Unknown Customer'}
                                                    </h3>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor}`}
                                                    >
                                                        {delivery.status}
                                                    </span>

                                                </div>

                                                <div className="flex min-w-0 flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:flex-wrap sm:gap-4">

                                                    <div className="flex min-w-0 items-start gap-1">
                                                        <MapPin
                                                            size={14}
                                                            className="mt-0.5 shrink-0"
                                                        />

                                                        <span className="min-w-0 break-words">
                                                            {delivery.Customer?.address ||
                                                                'No address'}
                                                        </span>
                                                    </div>

                                                    {delivery.createdAt && (
                                                        <div className="flex shrink-0 items-center gap-1">
                                                            <Clock size={14} />

                                                            <span>
                                                                {new Date(
                                                                    delivery.createdAt
                                                                ).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>

                                                <p className="mt-2 break-words text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">
                                                        Status:
                                                    </span>{' '}
                                                    {delivery.status}
                                                </p>

                                            </div>

                                            <div className="shrink-0">

                                                {delivery.status === 'Delivered' && (
                                                    <CheckCircle
                                                        className="text-green-500"
                                                        size={24}
                                                    />
                                                )}

                                                {delivery.status === 'In Transit' && (
                                                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                                                )}

                                                {delivery.status === 'Pending' && (
                                                    <AlertCircle
                                                        className="text-yellow-500"
                                                        size={24}
                                                    />
                                                )}

                                                {delivery.status === 'Failed' && (
                                                    <AlertCircle
                                                        className="text-red-500"
                                                        size={24}
                                                    />
                                                )}

                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        )}

                    </div>
                </div>

                {/* ================= VEHICLE STATUS ================= */}
                <div className="min-w-0 space-y-5 lg:space-y-6">

                    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5 lg:p-6">

                        <div className="mb-4 flex items-center gap-2">
                            <Truck
                                className="shrink-0 text-blue-600"
                                size={22}
                            />

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                                Vehicle Status
                            </h2>
                        </div>

                        <div className="space-y-4">

                            <div className="space-y-3">

                                {/* Registration */}
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                        Registration
                                    </span>

                                    <span className="min-w-0 break-all font-semibold text-gray-900 dark:text-white sm:text-right">
                                        {vehicleStatus.registrationNo}
                                    </span>
                                </div>

                                {/* Type */}
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                        Type
                                    </span>

                                    <span className="min-w-0 break-words font-medium text-gray-900 dark:text-white sm:text-right">
                                        {vehicleStatus.type}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                        Location
                                    </span>

                                    <div className="flex min-w-0 items-start gap-1 text-gray-900 dark:text-white sm:justify-end">
                                        <MapPin
                                            size={14}
                                            className="mt-1 shrink-0 text-blue-600"
                                        />

                                        <span className="min-w-0 break-words font-medium sm:text-right">
                                            {vehicleStatus.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                        Status
                                    </span>

                                    <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300 sm:ml-auto">
                                        {vehicleStatus.status}
                                    </span>
                                </div>

                            </div>

                            {/* Fuel Level */}
                            <div>

                                <div className="mb-2 flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Fuel size={14} />
                                        Fuel Level
                                    </span>

                                    <span className="shrink-0 font-semibold text-gray-900 dark:text-white">
                                        {vehicleStatus.fuelLevel}%
                                    </span>

                                </div>

                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                        style={{
                                            width: `${vehicleStatus.fuelLevel}%`
                                        }}
                                    ></div>

                                </div>

                            </div>

                            <div className="border-t pt-4 dark:border-gray-800">

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Last Service:{' '}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {vehicleStatus.lastService}
                                    </span>
                                </p>

                            </div>

                        </div>
                    </div>

                    {/* ================= RECENT ACTIVITY ================= */}
                    <div className="min-w-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-4 text-white shadow-lg sm:p-5 lg:p-6">

                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
                            <Clock size={22} />
                            Recent Activity
                        </h2>

                        <div className="space-y-3">

                            {recentDeliveries.length > 0 ? (
                                recentDeliveries.map((delivery) => (

                                    <div
                                        key={delivery.id}
                                        className="min-w-0 overflow-hidden rounded-lg bg-white bg-opacity-20 p-3 backdrop-blur-sm"
                                    >

                                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                            <span className="min-w-0 break-words text-sm font-medium text-white">
                                                {delivery.Customer?.ownerName ||
                                                    delivery.Customer?.shopName ||
                                                    'Unknown Customer'}
                                            </span>

                                            <span
                                                className={`w-fit shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${delivery.status === 'Delivered'
                                                    ? 'bg-green-400 text-green-900'
                                                    : delivery.status === 'In Transit'
                                                        ? 'bg-blue-400 text-blue-900'
                                                        : delivery.status === 'Pending'
                                                            ? 'bg-yellow-400 text-yellow-900'
                                                            : 'bg-red-400 text-red-900'
                                                    }`}
                                            >
                                                {delivery.status}
                                            </span>

                                        </div>

                                        <div className="mt-2 flex min-w-0 items-start gap-2 text-xs text-indigo-100">
                                            <MapPin
                                                size={12}
                                                className="mt-0.5 shrink-0"
                                            />

                                            <span className="min-w-0 break-words">
                                                {delivery.Customer?.address ||
                                                    'No address'}
                                            </span>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg bg-white bg-opacity-20 p-4 text-center backdrop-blur-sm">
                                    <p className="text-sm text-indigo-100">
                                        No recent activity
                                    </p>
                                </div>
                            )}

                        </div>

                        <div className="mt-6 border-t border-white border-opacity-30 pt-4">

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <p className="mb-1 text-xs text-indigo-100">
                                        Total Today
                                    </p>

                                    <p className="text-2xl font-bold">
                                        {deliveryStats.total}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs text-indigo-100">
                                        Completed
                                    </p>

                                    <p className="text-2xl font-bold">
                                        {deliveryStats.completed}
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

            

        </div>
    );
}