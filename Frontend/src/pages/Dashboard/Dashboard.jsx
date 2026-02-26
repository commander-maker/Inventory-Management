import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplet, Package, Users, Plus, Truck, DollarSign, User, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { deliveryAPI, inventoryAPI, userAPI, financeAPI } from '../../utils/api';

export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [deliveryRes, inventoryRes, userRes, incomeRes] = await Promise.all([
          deliveryAPI.getAll(),
          inventoryAPI.getAll(),
          userAPI.getAll(),
          financeAPI.getIncome()
        ]);

        // ── Deliveries ──
        const deliveryData = deliveryRes.data.data || [];
        setDeliveries(deliveryData);

        const stats = {
          total: deliveryData.length,
          pending: deliveryData.filter(d => d.status === 'Pending').length,
          inTransit: deliveryData.filter(d => d.status === 'In Transit').length,
          delivered: deliveryData.filter(d => d.status === 'Delivered').length,
          failed: deliveryData.filter(d => d.status === 'Failed').length
        };
        setDeliveryStats(stats);

        // Calculate total revenue from delivered orders
        const revenue = deliveryData
          .filter(d => d.status === 'Delivered' && d.totalAmount)
          .reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
        setTotalRevenue(revenue);

        // ── Income ── 
        const incomeData = incomeRes.data.data || [];

        // Add income revenue to total
        const incomeRevenue = incomeData.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
        setTotalRevenue(revenue + incomeRevenue);

        // Build recent transactions from both deliveries and income (sorted by date, newest first)
        const sortedDeliveries = [...deliveryData]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        const deliveryTransactions = sortedDeliveries.slice(0, 4).map(d => {
          const timeAgo = getTimeAgo(d.updatedAt || d.createdAt);
          return {
            id: `del-${d.id}`,
            type: 'delivery',
            product: `${d.productName || 'Product'} (${d.quantity || ''})`,
            amount: d.totalAmount ? `LKR ${parseFloat(d.totalAmount).toLocaleString()}` : '—',
            time: timeAgo,
            person: d.Vehicle?.driver?.name || d.User?.name || d.Customer?.ownerName || 'Unknown',
            icon: getTransactionIcon(d.productName),
            color: getTransactionColor(d.productName),
            iconColor: getTransactionIconColor(d.productName),
            status: d.status,
            date: new Date(d.updatedAt || d.createdAt)
          };
        });

        // Map income records to transactions
        const incomeTransactions = incomeData.slice(0, 4).map(inc => {
          const timeAgo = getTimeAgo(inc.date || inc.createdAt);
          const description = inc.description || 'Sale';
          const productName = description.includes('of') ? description.split('of')[1]?.split('to')[0]?.trim() : 'Product';
          
          return {
            id: `inc-${inc.id}`,
            type: 'sale',
            product: productName,
            amount: `LKR ${parseFloat(inc.amount).toLocaleString()}`,
            time: timeAgo,
            person: inc.Customer?.shopName || inc.Customer?.ownerName || inc.User?.name || 'Customer',
            icon: getTransactionIcon(productName),
            color: 'bg-green-100',
            iconColor: 'text-green-600',
            status: 'Completed',
            date: new Date(inc.date || inc.createdAt)
          };
        });

        // Combine and sort all transactions by date
        const allTransactions = [...deliveryTransactions, ...incomeTransactions]
          .sort((a, b) => b.date - a.date)
          .slice(0, 4);
        
        setRecentTransactions(allTransactions);

        // ── Inventory ──
        const inventoryData = inventoryRes.data.data || [];
        setInventory(inventoryData);

        // Total product count (sum of stock)
        const productCount = inventoryData.reduce((sum, item) => sum + (item.stock || 0), 0);
        setTotalProducts(productCount);

        // Low stock items (stock <= 15)
        const lowStock = inventoryData
          .filter(item => item.stock <= 15)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 4)
          .map(item => ({
            id: item.id,
            name: item.name,
            category: item.category || 'General',
            stock: item.stock,
            status: item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Critical' : item.stock <= 10 ? 'Low' : 'Medium',
            statusColor: item.stock === 0 ? 'bg-gray-100 text-gray-800' : item.stock <= 5 ? 'bg-red-50 text-red-700' : item.stock <= 10 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700',
            badgeColor: item.stock === 0 ? 'bg-gray-100 text-gray-700' : item.stock <= 5 ? 'bg-red-100 text-red-700' : item.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }));
        setLowStockItems(lowStock);

        // ── Users ──
        const userData = userRes.data.data || [];
        const agentCount = userData.filter(u => u.role === 'agent').length;
        setTotalAgents(agentCount);
        setAgents(userData.filter(u => u.role === 'agent'));

        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper: calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Helper: get icon based on product name
  const getTransactionIcon = (productName) => {
    if (!productName) return Package;
    const name = productName.toLowerCase();
    if (name.includes('water') || name.includes('mineral')) return Droplet;
    if (name.includes('energy') || name.includes('bull') || name.includes('monster')) return AlertTriangle;
    return Package;
  };

  const getTransactionColor = (productName) => {
    if (!productName) return 'bg-gray-100';
    const name = productName.toLowerCase();
    if (name.includes('water') || name.includes('mineral')) return 'bg-blue-100';
    if (name.includes('energy') || name.includes('bull') || name.includes('monster')) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTransactionIconColor = (productName) => {
    if (!productName) return 'text-gray-500';
    const name = productName.toLowerCase();
    if (name.includes('water') || name.includes('mineral')) return 'text-blue-500';
    if (name.includes('energy') || name.includes('bull') || name.includes('monster')) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Stats data — all from API
  const stats = [
    { label: 'Total Revenue', value: `LKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-100' },
    { label: 'Total Products', value: totalProducts.toLocaleString(), icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { label: 'Sales Agents', value: totalAgents.toString(), icon: Users, color: 'text-red-500', bgColor: 'bg-red-100' },
    { label: 'Total Deliveries', value: deliveryStats.total.toString(), icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100' }
  ];

  // Quick actions
  const quickActions = [
    { icon: Plus, label: 'Add Inventory', color: 'text-gray-700', path: '/inventory' },
    { icon: Truck, label: 'Dispatch Vehicle', color: 'text-gray-700', path: '/vehicle' },
    { icon: DollarSign, label: 'Record Payment', color: 'text-gray-700', path: '/financial' },
    { icon: User, label: 'Add Agent', color: 'text-gray-700', path: '/users' }
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
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stat.value}
                  </p>
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

        {/* Recent Transactions — from deliveries API */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Transactions</h2>
          <p className="text-gray-600 text-sm mb-6">Latest sales and inventory movements</p>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading transactions...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
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
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Handled by</p>
                            <p className="font-medium text-gray-900">{transaction.person}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            <p className={`font-medium ${transaction.status === 'Delivered' ? 'text-green-600' :
                              transaction.status === 'In Transit' ? 'text-blue-600' :
                                transaction.status === 'Pending' ? 'text-yellow-600' :
                                  'text-red-600'
                              }`}>{transaction.status}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivery ID</p>
                            <p className="font-medium text-gray-900">DEL-{transaction.id}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alert & Delivery Stats */}
        <div className="col-span-2 space-y-6">
          {/* Low Stock Alert — from inventory API */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Items requiring immediate attention</p>

            {loading ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="py-4 text-center text-green-600 font-medium">✅ All items are well stocked!</div>
            ) : (
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
            )}
          </div>

          {/* Delivery Status Overview — from delivery API */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Status Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{loading ? '...' : deliveryStats.pending}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-blue-800">{loading ? '...' : deliveryStats.inTransit}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-800">{loading ? '...' : deliveryStats.delivered}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-800">{loading ? '...' : deliveryStats.failed}</p>
              </div>
            </div>
          </div>
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
                onClick={() => window.location.href = action.path}
              >
                <Icon className={`${action.color} mb-3`} size={32} />
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
