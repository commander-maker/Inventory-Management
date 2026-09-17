import React, { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, FileText, RefreshCw, TrendingUp } from 'lucide-react';
import { financeAPI } from '../../utils/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatAmount = (amount) => `LKR ${parseFloat(amount || 0).toLocaleString()}`;

export default function MyTransactions() {
  const currentYear = new Date().getFullYear();
  const [transactions, setTransactions] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(currentYear);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { year: filterYear };
      if (filterMonth) params.month = parseInt(filterMonth);

      const response = await financeAPI.getIncome(params);
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch agent transactions:', err);
      setError(err.response?.data?.message || 'Unable to load your transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterMonth, filterYear]);

  const totalIncome = transactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.amount || 0),
    0
  );

  const periodLabel = filterMonth
    ? `${MONTHS[parseInt(filterMonth) - 1]} ${filterYear}`
    : `Year ${filterYear}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">Your recorded sales and income</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
              <select
                value={filterMonth}
                onChange={(event) => setFilterMonth(event.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="">All Months</option>
                {MONTHS.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(event) => setFilterYear(parseInt(event.target.value))}
                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchTransactions}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Refresh transactions"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 xs:p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Income</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{formatAmount(totalIncome)}</p>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{periodLabel}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 xs:p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Transactions</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{periodLabel}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 xs:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg xs:text-xl font-bold text-gray-900 dark:text-white">Income Records</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">Sales assigned to you for {periodLabel.toLowerCase()}</p>

          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading transactions...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 dark:text-red-400">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No transactions found for this period.</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isExpanded = expandedId === transaction.id;
                return (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
                    className="w-full text-left border border-gray-200 dark:border-gray-800 rounded-lg p-3 xs:p-4 hover:shadow-md dark:hover:bg-gray-800 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm xs:text-base text-gray-900 dark:text-white truncate">{transaction.description}</p>
                        <p className="text-xs xs:text-sm text-gray-500 dark:text-gray-400">
                          {transaction.category} · {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <p className="font-semibold text-sm xs:text-base text-green-600 dark:text-green-400">{formatAmount(transaction.amount)}</p>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 pl-11 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                        <p>Transaction ID: <span className="font-medium text-gray-900 dark:text-white">{transaction.id}</span></p>
                        <p>Agent ID: <span className="font-medium text-gray-900 dark:text-white">{transaction.agentId || 'Not assigned'}</span></p>
                        <p>Customer: <span className="font-medium text-gray-900 dark:text-white">{transaction.Customer?.shopName || transaction.customerId || 'Walk-in'}</span></p>
                        <p>Payment: <span className="font-medium text-gray-900 dark:text-white">{transaction.paymentMethod || 'Not specified'}</span></p>
                        <p>Type: <span className="font-medium text-gray-900 dark:text-white">{transaction.type}</span></p>
                        {transaction.receiptNumber && <p>Receipt: <span className="font-medium text-gray-900 dark:text-white">{transaction.receiptNumber}</span></p>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
