import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, User, Fuel, Wrench, Zap, MoreHorizontal } from 'lucide-react';

export default function FinanceDashboard() {
  const [expandedExpense, setExpandedExpense] = useState(null);

  // Stats data
  const stats = [
    { label: 'Total income', value: '500 000 LKR', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: 'Total Expenses', value: '300 000 LKR', icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-50' },
    { label: 'Net Profit', value: '200 000 LKR', icon: DollarSign, color: 'text-blue-500', bgColor: 'bg-blue-50' }
  ];

  // Expense breakdown data
  const expenses = [
    { 
      id: 1,
      category: 'Salary', 
      percentage: 37.5, 
      amount: '100 000 LKR', 
      person: 'Rajesh Kumar',
      icon: User,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-100'
    },
    { 
      id: 2,
      category: 'Fuel/Diesel', 
      percentage: 26.6, 
      amount: '20 000 LKR', 
      person: 'Priya Sharma',
      icon: Fuel,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-100'
    },
    { 
      id: 3,
      category: 'Vehicle Maintenance', 
      percentage: 14.1, 
      amount: '10 000 LKR', 
      person: 'Nimesh',
      icon: Wrench,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-100'
    },
    { 
      id: 4,
      category: 'Utilities', 
      percentage: 6.3, 
      amount: '10 000 LKR', 
      person: 'Dilanika',
      icon: Zap,
      color: 'bg-green-500',
      bgLight: 'bg-green-100'
    },
    { 
      id: 5,
      category: 'Others', 
      percentage: 4.7, 
      amount: '15 000 LKR', 
      person: 'Dilanika',
      icon: MoreHorizontal,
      color: 'bg-gray-500',
      bgLight: 'bg-gray-100'
    }
  ];

  // Recent expenses data
  const recentExpenses = [
    { 
      id: 1,
      title: 'Driver Salary - Rajesh Kumar', 
      date: '2025-01-08', 
      amount: '100 000 LKR',
      icon: User,
      bgColor: 'bg-blue-100'
    },
    { 
      id: 2,
      title: 'Diesel Fill - Vehicle ABE 235', 
      date: '2025-01-09', 
      amount: '3 000 LKR',
      icon: Fuel,
      bgColor: 'bg-orange-100'
    },
    { 
      id: 3,
      title: 'Vehicle Repair - Vehicle ABE 235', 
      date: '2025-01-08', 
      amount: '5 000 LKR',
      icon: Wrench,
      bgColor: 'bg-purple-100'
    },
    { 
      id: 4,
      title: 'Warehouse Electricity Bill', 
      date: '2025-01-08', 
      amount: '6 000 LKR',
      icon: Zap,
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
        <p className="text-gray-600 mt-1">Track income, expenses, and generate financial reports</p>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
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
      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        
        {/* Expense Breakdown */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Expense Breakdown</h2>
          <p className="text-gray-600 text-sm mb-6">Monthly expense distribution by category</p>
          
          <div className="space-y-4">
            {expenses.map((expense) => {
              const IconComponent = expense.icon;
              return (
                <div 
                  key={expense.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => setExpandedExpense(expandedExpense === expense.id ? null : expense.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${expense.bgLight}`}>
                      <IconComponent className={`${expense.color} text-white`} size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{expense.category}</h3>
                        <span className="text-lg font-bold text-gray-900">{expense.amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={expense.color} 
                            style={{width: `${expense.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{expense.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedExpense === expense.id && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Person Responsible:</span> {expense.person}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Expenses</h2>
          <p className="text-gray-600 text-sm mb-6">Latest financial transactions</p>
          
          <div className="space-y-4">
            {recentExpenses.map((expense) => {
              const IconComponent = expense.icon;
              return (
                <div key={expense.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${expense.bgColor}`}>
                    <IconComponent className="text-gray-700" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{expense.title}</p>
                    <p className="text-xs text-gray-500">{expense.date}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{expense.amount}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}