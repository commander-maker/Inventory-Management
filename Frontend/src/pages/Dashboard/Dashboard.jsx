import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplet, Package, Users, Plus, Truck, DollarSign, User, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { deliveryAPI } from '../../utils/api';

export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch deliveries on component mount
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const response = await deliveryAPI.getAll();
        const deliveryData = response.data.data || [];
        setDeliveries(deliveryData);

        // Calculate statistics
        const stats = {
          total: deliveryData.length,
          pending: deliveryData.filter(d => d.status === 'Pending').length,
          inTransit: deliveryData.filter(d => d.status === 'In Transit').length,
          delivered: deliveryData.filter(d => d.status === 'Delivered').length,
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

  // Stats data
  const stats = [
    { label: 'Total Revenue', value: '500 000 LKR', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-100' },
    { label: 'Total Product', value: '1250', icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { label: 'Sales Agents', value: '12', icon: Users, color: 'text-red-500', bgColor: 'bg-red-100' },
    { label: 'Total Deliveries', value: deliveryStats.total.toString(), icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100' }
  ];

  // Recent transactions data
  const transactions = [
    {
      id: 1,
      product: 'Water Bottles-500ml (50 cases)',
      amount: '10 000 LKR',
      time: '2 hours ago',
      person: 'Rajesh Kumar',
      icon: Droplet,
      color: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      id: 2,
      product: 'Soft Drinks - Pepsi (30 cases)',
      amount: '12 000 LKR',
      time: '4 hours ago',
      person: 'Priya Sharma',
      icon: Package,
      color: 'bg-red-100',
      iconColor: 'text-red-500'
    },
    {
      id: 3,
      product: 'Mineral Water -1L (25 cases)',
      amount: '15 000 LKR',
      time: '6 hours ago',
      person: 'Nimesh',
      icon: Droplet,
      color: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      id: 4,
      product: 'Energy Drinks - Red Bull (10 cases)',
      amount: '20 000 LKR',
      time: '8 hours ago',
      person: 'Dilanka',
      icon: AlertTriangle,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-500'
    }
  ];

  // Low stock items
  const lowStockItems = [
    {
      id: 1,
      name: 'Water Bottles 500ml',
      category: 'Packaged Water',
      stock: 10,
      status: 'Critical',
      statusColor: 'bg-red-100 text-red-800',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 2,
      name: 'Pepsi 300ml',
      category: 'Soft Drinks',
      stock: 8,
      status: 'Low',
      statusColor: 'bg-red-50 text-red-700',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 3,
      name: 'Mineral Water 1L',
      category: 'Packaged Water',
      stock: 12,
      status: 'Medium',
      statusColor: 'bg-yellow-50 text-yellow-700',
      badgeColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 4,
      name: 'Red Bull Energy',
      category: 'Energy Drinks',
      stock: 5,
      status: 'Critical',
      statusColor: 'bg-red-50 text-red-700',
      badgeColor: 'bg-red-100 text-red-700'
    }
  ];

  // Quick actions
  const quickActions = [
    { icon: Plus, label: 'Add Inventory', color: 'text-gray-700' },
    { icon: Truck, label: 'Dispatch Vehicle', color: 'text-gray-700' },
    { icon: DollarSign, label: 'Record Payment', color: 'text-gray-700' },
    { icon: User, label: 'Add Agent', color: 'text-gray-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business</p>
      </div>

      {/* Stats Section */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm mb-3">{stat.label}</p>
                <div className="flex justify-between items-center">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`${stat.color}`} size={28} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 grid grid-cols-4 gap-6">
        
        {/* Recent Transactions */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Transactions</h2>
          <p className="text-gray-600 text-sm mb-6">Latest sales and inventory movements</p>
          
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div 
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${transaction.color}`}>
                      <Icon className={`${transaction.iconColor}`} size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{transaction.product}</p>
                      <p className="text-sm text-gray-500">{transaction.time}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{transaction.amount}</p>
                      <p className="text-sm text-gray-500">{transaction.person}</p>
                    </div>
                  </div>

                  {selectedTransaction === transaction.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Handled by</p>
                          <p className="font-medium text-gray-900">{transaction.person}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Transaction ID</p>
                          <p className="font-medium text-gray-900">TXN-{transaction.id.toString().padStart(5, '0')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alert & Delivery Stats */}
        <div className="col-span-2 space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Items requiring immediate attention</p>
            
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.badgeColor}`}>
                      {item.stock} left
                    </span>
                  </div>
                  <div className={`py-1 px-2 rounded text-xs font-medium text-center ${item.statusColor}`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Status Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Status Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{deliveryStats.pending}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-blue-800">{deliveryStats.inTransit}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-800">{deliveryStats.delivered}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-800">{deliveryStats.failed}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Deliveries</h2>
          <p className="text-gray-600 text-sm mb-6">Latest delivery updates from your fleet</p>
          
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading deliveries...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">Error loading deliveries: {error}</div>
          ) : deliveries.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No deliveries yet</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {deliveries.slice(0, 4).map((delivery) => (
                <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2">{delivery.vehicleLoad?.customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-gray-500 mt-1">{delivery.vehicleLoad?.customer?.address || 'No address'}</p>
                    </div>
                    {delivery.status === 'Delivered' && (
                      <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                    )}
                    {delivery.status === 'In Transit' && (
                      <Clock className="text-blue-500 flex-shrink-0" size={18} />
                    )}
                    {delivery.status === 'Pending' && (
                      <AlertCircle className="text-yellow-500 flex-shrink-0" size={18} />
                    )}
                    {delivery.status === 'Failed' && (
                      <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      delivery.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>

                  {delivery.deliveredAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(delivery.deliveredAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 py-6 bg-white rounded-lg shadow-sm border border-gray-100 mx-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
        <p className="text-gray-600 text-sm mb-6">Frequently used actions for faster workflow</p>
        
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition"
              >
                <Icon className={`${action.color} mb-3`} size={32} />
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
