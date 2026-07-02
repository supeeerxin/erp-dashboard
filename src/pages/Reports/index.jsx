import React, { useState, useMemo } from 'react'
import { 
  BarChart3, Download, Printer, FileSpreadsheet, TrendingUp, TrendingDown, 
  DollarSign, Users, Package, CreditCard, Calendar, Filter, AlertCircle,
  Building, Receipt
} from 'lucide-react'
import { useRiceCredit } from '../../context/RiceCreditContext'
import { useCashLoans } from '../../context/CashLoanContext'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useIncome } from '../../context/IncomeContext'
import { useExpenses } from '../../context/ExpenseContext'
import { useCustomers } from '../../context/CustomerContext'
import { usePayables } from '../../context/PayableContext'
import { useNotification } from '../../context/NotificationContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const Reports = () => {
  const { darkMode } = useTheme()
  const { showNotification } = useNotification()
  const [activeReport, setActiveReport] = useState('sales')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Get data from contexts
  const { transactions: riceCredits } = useRiceCredit()
  const { loans: cashLoans } = useCashLoans()
  const { orders: breadOrders } = useBreadOrders()
  const { incomes } = useIncome()
  const { expenses } = useExpenses()
  const { customers } = useCustomers()
  const { payables } = usePayables()

  // Calculate totals
  const totals = useMemo(() => {
    const totalRiceCredit = riceCredits?.reduce((sum, t) => sum + (t.totalSellingPrice || t.amount || 0), 0) || 0
    const totalBreadOrders = breadOrders?.reduce((sum, o) => sum + (o.totalSellingPrice || 0), 0) || 0
    const totalCashLoans = cashLoans?.reduce((sum, l) => sum + (l.totalPayable || l.principal || 0), 0) || 0
    const totalIncome = incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
    const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
    
    const totalRevenue = totalRiceCredit + totalBreadOrders + totalCashLoans
    const netProfit = (totalRevenue + totalIncome) - totalExpenses

    // Payables calculations
    const totalPayables = payables?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const totalPaidPayables = payables?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const totalUnpaidPayables = payables?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const overduePayables = payables?.filter(p => p.status === 'overdue').length || 0
    const unpaidCount = payables?.filter(p => p.status !== 'paid').length || 0

    // Payables by category
    const payablesByCategory = payables?.reduce((acc, p) => {
      const category = p.category || 'Other'
      acc[category] = (acc[category] || 0) + (p.amount || 0)
      return acc
    }, {}) || {}

    return {
      totalRevenue,
      totalIncome,
      totalExpenses,
      netProfit,
      totalRiceCredit,
      totalBreadOrders,
      totalCashLoans,
      totalCustomers: customers?.length || 0,
      activeLoans: cashLoans?.filter(l => l.status === 'active').length || 0,
      completedOrders: breadOrders?.filter(o => o.status === 'completed').length || 0,
      overdueCount: cashLoans?.filter(l => l.status === 'overdue').length || 0,
      // Payables
      totalPayables,
      totalPaidPayables,
      totalUnpaidPayables,
      overduePayables,
      unpaidCount,
      payablesByCategory
    }
  }, [riceCredits, breadOrders, cashLoans, incomes, expenses, customers, payables])

  // Prepare chart data
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
          color: darkMode ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return '₱' + value.toLocaleString()
          }
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

  const revenueData = {
    labels: ['Rice Credit', 'Bread Orders', 'Cash Loans', 'Income'],
    datasets: [
      {
        label: 'Revenue',
        data: [totals.totalRiceCredit, totals.totalBreadOrders, totals.totalCashLoans, totals.totalIncome],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(139, 92, 246, 0.8)'],
        borderColor: ['#3b82f6', '#eab308', '#22c55e', '#8b5cf6'],
        borderWidth: 2
      }
    ]
  }

  const profitData = {
    labels: ['Revenue', 'Expenses', 'Net Profit'],
    datasets: [
      {
        label: 'Financial Summary',
        data: [totals.totalRevenue + totals.totalIncome, totals.totalExpenses, totals.netProfit],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          totals.netProfit >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#22c55e',
          '#ef4444',
          totals.netProfit >= 0 ? '#22c55e' : '#ef4444'
        ],
        borderWidth: 2
      }
    ]
  }

  // Payables chart data
  const payablesChartData = {
    labels: ['Paid', 'Unpaid', 'Overdue'],
    datasets: [
      {
        label: 'Payables',
        data: [totals.totalPaidPayables, totals.totalUnpaidPayables, totals.totalUnpaidPayables],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 2
      }
    ]
  }

  // Payables by category chart
  const payablesCategoryData = {
    labels: Object.keys(totals.payablesByCategory),
    datasets: [
      {
        label: 'By Category',
        data: Object.values(totals.payablesByCategory),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'],
        borderWidth: 2
      }
    ]
  }

  const handleExportCSV = () => {
    const data = [
      ['Report Type', 'Amount'],
      ['Total Revenue', totals.totalRevenue],
      ['Total Income', totals.totalIncome],
      ['Total Expenses', totals.totalExpenses],
      ['Net Profit', totals.netProfit],
      ['Rice Credit Sales', totals.totalRiceCredit],
      ['Bread Order Sales', totals.totalBreadOrders],
      ['Cash Loans', totals.totalCashLoans],
      ['Total Customers', totals.totalCustomers],
      ['Active Loans', totals.activeLoans],
      ['Overdue Loans', totals.overdueCount],
      ['--- Payables ---', ''],
      ['Total Payables', totals.totalPayables],
      ['Paid Payables', totals.totalPaidPayables],
      ['Unpaid Payables', totals.totalUnpaidPayables],
      ['Overdue Payables', totals.overduePayables],
      ['Unpaid Count', totals.unpaidCount]
    ]

    let csv = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Report exported successfully!', 'success')
  }

  const handlePrint = () => {
    window.print()
  }

  const reportCards = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'View all sales transactions',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Income and expense summary',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'payables',
      title: 'Payables Report',
      description: 'Bills, loans, and obligations',
      icon: Receipt,
      color: 'bg-red-500'
    },
    {
      id: 'customer',
      title: 'Customer Report',
      description: 'Customer activity and trends',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'loan',
      title: 'Loan Report',
      description: 'Credit and loan summaries',
      icon: CreditCard,
      color: 'bg-orange-500'
    }
  ]

  const renderReportContent = () => {
    switch (activeReport) {
      case 'sales':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rice Credit</p>
                <p className="text-xl font-bold text-blue-600">₱{totals.totalRiceCredit.toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Bread Orders</p>
                <p className="text-xl font-bold text-yellow-600">₱{totals.totalBreadOrders.toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Loans</p>
                <p className="text-xl font-bold text-green-600">₱{totals.totalCashLoans.toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                <p className="text-xl font-bold text-primary-500">₱{totals.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="card">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue Breakdown</h4>
              <div className="h-64">
                <Bar data={revenueData} options={chartOptions} />
              </div>
            </div>
          </div>
        )

      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="card p-4 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-xl font-bold text-green-600">₱{(totals.totalRevenue + totals.totalIncome).toLocaleString()}</p>
              </div>
              <div className="card p-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">₱{totals.totalExpenses.toLocaleString()}</p>
              </div>
              <div className={`card p-4 ${totals.netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                <p className={`text-xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{totals.netProfit.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="card">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profit Summary</h4>
              <div className="h-64">
                <Bar data={profitData} options={chartOptions} />
              </div>
            </div>
          </div>
        )

      case 'payables':
        return (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payables</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₱{totals.totalPayables.toLocaleString()}</p>
              </div>
              <div className="card p-4 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                <p className="text-xl font-bold text-green-600">₱{totals.totalPaidPayables.toLocaleString()}</p>
              </div>
              <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid</p>
                <p className="text-xl font-bold text-yellow-600">₱{totals.totalUnpaidPayables.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{totals.unpaidCount} items</p>
              </div>
              <div className="card p-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-xl font-bold text-red-600">{totals.overduePayables}</p>
                <p className="text-xs text-gray-500">items overdue</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Payables Status</h4>
                <div className="h-64">
                  <Bar data={payablesChartData} options={chartOptions} />
                </div>
              </div>
              <div className="card">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">By Category</h4>
                <div className="h-64">
                  {Object.keys(totals.payablesByCategory).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                      <p className="text-sm">No payables data</p>
                    </div>
                  ) : (
                    <Bar data={payablesCategoryData} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Unpaid Payables List */}
            <div className="card">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Unpaid Payables ({totals.unpaidCount})
              </h4>
              {payables?.filter(p => p.status !== 'paid').length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">All payables are paid! 🎉</p>
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
                      {payables?.filter(p => p.status !== 'paid').map(p => (
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

      case 'customer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-xl font-bold text-purple-600">{totals.totalCustomers}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
                <p className="text-xl font-bold text-blue-600">{totals.activeLoans}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
                <p className="text-xl font-bold text-green-600">{totals.completedOrders}</p>
              </div>
            </div>
            <div className="card">
              <div className="empty-state">
                <Users className="empty-state-icon" />
                <p className="empty-state-text">Customer Report</p>
                <p className="empty-state-subtext">
                  Detailed customer analytics coming soon
                </p>
              </div>
            </div>
          </div>
        )

      case 'loan':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
                <p className="text-xl font-bold text-blue-600">{totals.activeLoans}</p>
              </div>
              <div className="card p-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</p>
                <p className="text-xl font-bold text-red-600">{totals.overdueCount}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Loan Amount</p>
                <p className="text-xl font-bold text-primary-500">₱{totals.totalCashLoans.toLocaleString()}</p>
              </div>
            </div>
            <div className="card">
              <div className="empty-state">
                <CreditCard className="empty-state-icon" />
                <p className="empty-state-text">Loan Report</p>
                <p className="empty-state-subtext">
                  Detailed loan analytics coming soon
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and view business reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {reportCards.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`card card-hover text-left transition-all ${activeReport === report.id ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${report.color} text-white`}>
                <report.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {report.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {report.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        {renderReportContent()}
      </div>
    </div>
  )
}

export default Reports
