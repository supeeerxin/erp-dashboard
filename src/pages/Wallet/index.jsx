import React, { useState, useEffect } from 'react'
import { Wallet as WalletIcon, TrendingUp, TrendingDown, CreditCard, DollarSign, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { useIncome } from '../../context/IncomeContext'
import { useExpenses } from '../../context/ExpenseContext'
import { usePayables } from '../../context/PayableContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Wallet = () => {
  const { darkMode } = useTheme()
  const { getTotals: getIncomeTotals, incomes } = useIncome()
  const { getTotals: getExpenseTotals, expenses } = useExpenses()
  const { getTotals: getPayableTotals, payables } = usePayables()

  const [timeframe, setTimeframe] = useState('all') // all, month, week

  const incomeTotals = getIncomeTotals()
  const expenseTotals = getExpenseTotals()
  const payableTotals = getPayableTotals()

  // Calculate cash flow
  const totalIncome = incomeTotals.totalAmount || 0
  const totalExpenses = expenseTotals.totalAmount || 0
  const netProfit = totalIncome - totalExpenses
  const unpaidPayables = payableTotals.totalUnpaid || 0
  const cashOnHand = netProfit - unpaidPayables

  // Get monthly data
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const incomeByMonth = {}
    const expenseByMonth = {}

    // Initialize months
    months.forEach(m => {
      incomeByMonth[m] = 0
      expenseByMonth[m] = 0
    })

    // Sum income by month
    incomes.forEach(inc => {
      if (!inc.isDeleted) {
        const date = new Date(inc.date || inc.createdAt)
        const month = months[date.getMonth()]
        incomeByMonth[month] = (incomeByMonth[month] || 0) + (inc.amount || 0)
      }
    })

    // Sum expenses by month
    expenses.forEach(exp => {
      if (!exp.isDeleted) {
        const date = new Date(exp.date || exp.createdAt)
        const month = months[date.getMonth()]
        expenseByMonth[month] = (expenseByMonth[month] || 0) + (exp.amount || 0)
      }
    })

    return { incomeByMonth, expenseByMonth }
  }

  const monthlyData = getMonthlyData()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: months.map(m => monthlyData.incomeByMonth[m] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: months.map(m => monthlyData.expenseByMonth[m] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        }
      },
      x: {
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        }
      }
    }
  }

  const getCategoryData = () => {
    const expenseCategories = expenseTotals.byCategory || {}
    const sorted = Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    const colors = [
      '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
    ]

    return {
      labels: sorted.map(([cat]) => cat),
      datasets: [
        {
          data: sorted.map(([, amount]) => amount),
          backgroundColor: colors.slice(0, sorted.length),
          borderColor: darkMode ? '#1f2937' : '#ffffff',
          borderWidth: 2
        }
      ]
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 15
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overall cash flow and financial overview
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            ₱{totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            ₱{totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
          </div>
          <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ₱{netProfit.toLocaleString()}
          </p>
        </div>

        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Cash on Hand</p>
          </div>
          <p className={`text-2xl font-bold mt-2 ${cashOnHand >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ₱{cashOnHand.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Net Profit - Unpaid Payables (₱{unpaidPayables.toLocaleString()})
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Income Entries</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{incomeTotals.count || 0}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Expense Entries</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{expenseTotals.count || 0}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Unpaid Payables</p>
          <p className="text-lg font-bold text-red-500">{payableTotals.unpaidCount || 0}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-lg font-bold text-red-500">{payableTotals.overdueCount || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2 card">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Monthly Income vs Expenses
          </h4>
          <div className="h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Expense Categories
          </h4>
          <div className="h-64">
            {Object.keys(expenseTotals.byCategory || {}).length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <p className="text-sm">No expense data yet</p>
              </div>
            ) : (
              <Doughnut data={getCategoryData()} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Payables Summary */}
      <div className="card">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Unpaid Payables Summary
        </h4>
        {payables.filter(p => p.status !== 'paid').length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No unpaid payables</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Category</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Due Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payables.filter(p => p.status !== 'paid').slice(0, 5).map(p => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="py-2 text-sm text-gray-600 dark:text-gray-400">{p.category}</td>
                    <td className="py-2 text-sm text-right font-medium text-red-600">₱{p.amount.toLocaleString()}</td>
                    <td className="py-2 text-sm text-gray-500 dark:text-gray-400">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2 text-sm">
                      <span className={`badge ${p.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                        {p.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet
