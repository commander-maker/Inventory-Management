import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, User, Fuel, Wrench,
  Zap, MoreHorizontal, Plus, X, Calendar, FileText, Trash2,
  RefreshCw, ChevronDown
} from 'lucide-react';
import { financeAPI, vehicleAPI, userAPI } from '../../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EXPENSE_CATEGORIES = [
  { value: 'Salary', label: 'Salary', icon: User, color: 'bg-blue-500', bgLight: 'bg-blue-100' },
  { value: 'Fuel', label: 'Fuel / Diesel', icon: Fuel, color: 'bg-orange-500', bgLight: 'bg-orange-100' },
  { value: 'Vehicle Repair', label: 'Vehicle Repair', icon: Wrench, color: 'bg-purple-500', bgLight: 'bg-purple-100' },
  { value: 'Tire Replacement', label: 'Tire Replacement', icon: Wrench, color: 'bg-pink-500', bgLight: 'bg-pink-100' },
  { value: 'Utilities', label: 'Utilities', icon: Zap, color: 'bg-green-500', bgLight: 'bg-green-100' },
  { value: 'Rent', label: 'Rent', icon: FileText, color: 'bg-teal-500', bgLight: 'bg-teal-100' },
  { value: 'Other', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-500', bgLight: 'bg-gray-100' },
];

const getCategoryMeta = (category) => {
  return EXPENSE_CATEGORIES.find(c => c.value === category) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};

export default function FinanceDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Filters
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // Add Expense Form
  const [form, setForm] = useState({
    type: 'Operational',
    category: 'Utilities',
    amount: '',
    description: '',
    vehicleId: '',
    agentId: '',
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    billingMonth: (now.getMonth() + 1).toString(),
    billingYear: now.getFullYear().toString()
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchDropdownData();
  }, [filterMonth, filterYear]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterMonth) params.month = parseInt(filterMonth);
      if (filterYear) params.year = parseInt(filterYear);

      const [expensesRes, incomeRes, summaryRes] = await Promise.all([
        financeAPI.getExpenses(params),
        financeAPI.getIncome(params),
        financeAPI.getSummary(params)
      ]);

      if (expensesRes.data.success) setExpenses(expensesRes.data.data);
      if (incomeRes.data.success) setIncome(incomeRes.data.data);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [agentsRes, vehiclesRes] = await Promise.all([
        userAPI.getAll(),
        vehicleAPI.getAll()
      ]);
      if (agentsRes.data.success) {
        setAgents(agentsRes.data.data.filter(u => u.role === 'agent'));
      }
      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      let description = form.description;
      // For Utilities, auto-add month info to description
      if (form.category === 'Utilities' || form.category === 'Rent') {
        const monthName = MONTHS[parseInt(form.billingMonth) - 1];
        if (!description.includes(monthName)) {
          description = `${description} - ${monthName} ${form.billingYear}`;
        }
      }

      const response = await financeAPI.createExpense({
        type: form.type,
        category: form.category,
        amount: form.amount,
        description,
        vehicleId: form.vehicleId || null,
        agentId: form.agentId || null,
        billNumber: form.billNumber || null,
        date: form.date
      });

      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchAll();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      alert(error.response?.data?.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await financeAPI.deleteExpense(selectedExpenseId);
      setShowDeleteDialog(false);
      setSelectedExpenseId(null);
      fetchAll();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const resetForm = () => {
    setForm({
      type: 'Operational',
      category: 'Utilities',
      amount: '',
      description: '',
      vehicleId: '',
      agentId: '',
      billNumber: '',
      date: new Date().toISOString().split('T')[0],
      billingMonth: (now.getMonth() + 1).toString(),
      billingYear: now.getFullYear().toString()
    });
  };

  // Compute breakdown percentages
  const totalExpenseAmount = summary ? parseFloat(summary.totalExpenses) : 0;
  const breakdownWithPercentage = (summary?.breakdown || []).map(b => ({
    ...b,
    percentage: totalExpenseAmount > 0 ? ((parseFloat(b.amount) / totalExpenseAmount) * 100).toFixed(1) : 0
  }));

  const formatAmount = (amount) => {
    return `LKR ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const filterLabel = filterMonth
    ? `${MONTHS[filterMonth - 1]} ${filterYear}`
    : `Year ${filterYear}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">Track income, expenses, and generate financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month/Year Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Months</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAll}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm mb-3">Total Income</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(summary?.totalIncome)}
                  </p>
                  <div className="p-3 rounded-lg bg-green-50">
                    <TrendingUp className="text-green-500" size={28} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{filterLabel}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm mb-3">Total Expenses</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(summary?.totalExpenses)}
                  </p>
                  <div className="p-3 rounded-lg bg-red-50">
                    <TrendingDown className="text-red-500" size={28} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{filterLabel}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm mb-3">Net Profit</p>
                <div className="flex justify-between items-center">
                  <p className={`text-2xl font-bold ${parseFloat(summary?.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(summary?.netProfit)}
                  </p>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <DollarSign className="text-blue-500" size={28} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{filterLabel}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-2 grid grid-cols-3 gap-6">
            {/* Expense Breakdown */}
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Expense Breakdown</h2>
              <p className="text-gray-600 text-sm mb-6">
                {filterLabel} expense distribution by category
              </p>

              {breakdownWithPercentage.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <DollarSign size={48} className="mx-auto mb-3" />
                  <p>No expenses for this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breakdownWithPercentage.map((item) => {
                    const meta = getCategoryMeta(item.category);
                    const IconComponent = meta.icon;
                    return (
                      <div
                        key={item.category}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => setExpandedExpense(expandedExpense === item.category ? null : item.category)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${meta.bgLight}`}>
                            <IconComponent className={`${meta.color} text-white`} size={24} />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">{item.category}</h3>
                              <span className="text-lg font-bold text-gray-900">{formatAmount(item.amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`${meta.color} h-2 rounded-full transition-all`}
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{item.percentage}%</span>
                            </div>
                          </div>
                        </div>

                        {expandedExpense === item.category && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Number of entries:</span> {item.count}
                            </p>
                            {/* Show individual expenses for this category */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {expenses
                                .filter(e => e.category === item.category)
                                .map(exp => (
                                  <div key={exp.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{exp.description}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(exp.date).toLocaleDateString()}
                                        {exp.billNumber && ` · Bill: ${exp.billNumber}`}
                                        {exp.User_Expense_agentIdToUser && ` · Agent: ${exp.User_Expense_agentIdToUser.name}`}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold text-gray-900">{formatAmount(exp.amount)}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedExpenseId(exp.id);
                                          setShowDeleteDialog(true);
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Expenses</h2>
              <p className="text-gray-600 text-sm mb-6">Latest financial transactions</p>

              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={36} className="mx-auto mb-2" />
                  <p className="text-sm">No recent expenses</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {expenses.slice(0, 15).map((expense) => {
                    const meta = getCategoryMeta(expense.category);
                    const IconComponent = meta.icon;
                    return (
                      <div key={expense.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${meta.bgLight}`}>
                          <IconComponent className="text-gray-700" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                          <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatAmount(expense.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expense Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Monthly Billing Info (for Utilities & Rent) */}
              {(form.category === 'Utilities' || form.category === 'Rent') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Billing Period (Month-wise)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Billing Month</label>
                      <select
                        value={form.billingMonth}
                        onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Billing Year</label>
                      <select
                        value={form.billingYear}
                        onChange={(e) => setForm({ ...form, billingYear: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {[2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (LKR)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={
                    form.category === 'Utilities' ? 'e.g. Warehouse electricity bill' :
                      form.category === 'Rent' ? 'e.g. Colombo warehouse monthly rent' :
                        form.category === 'Salary' ? 'e.g. Agent salary - Name' :
                          form.category === 'Fuel' ? 'e.g. Diesel for vehicle' :
                            'Enter description'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Bill Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bill Number (Optional)</label>
                <input
                  type="text"
                  value={form.billNumber}
                  onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                  placeholder="e.g. BILL-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Agent (for Salary, Fuel) */}
              {(form.category === 'Salary' || form.category === 'Fuel') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Agent (Optional)</label>
                  <select
                    value={form.agentId}
                    onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Agent</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle (for Fuel, Vehicle Repair, Tire Replacement) */}
              {(form.category === 'Fuel' || form.category === 'Vehicle Repair' || form.category === 'Tire Replacement') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle (Optional)</label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} - {v.vehicleType}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setSelectedExpenseId(null); }}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}