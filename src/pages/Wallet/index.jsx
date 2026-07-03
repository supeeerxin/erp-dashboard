import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Receipt,
  Package,
  ShoppingBag,
  Car,
  Users,
  BarChart3,
  ChevronRight,
  Eye
} from 'lucide-react'
import { useIncome } from '../../context/IncomeContext'
import { useExpenses } from '../../context/ExpenseContext'
import { usePayables } from '../../context/PayableContext'
import { useRiceCredit } from '../../context/RiceCreditContext'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useCashLoans } from '../../context/CashLoanContext'
import { useRentals } from '../../context/RentalContext'
import { useCustomers } from '../../context/CustomerContext'
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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

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

const Wallet = () => {
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  
  // Get data from all contexts
  const { getTotals: getIncomeTotals, incomes } = useIncome()
  const { getTotals: getExpenseTotals, expenses } = useExpenses()
  const { getTotals: getPayableTotals, payables } = usePayables()
  const { transactions: riceCredits } = useRiceCredit()
  const { orders: breadOrders } = useBreadOrders()
  const { loans: cashLoans } = useCashLoans()
  const { rentals } = useRentals()
  const { customers } = useCustomers()

  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [dateRange, setDateRange] = useState('all') // 'all', 'week', 'month'

  // Get current date for filtering
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // ============ INCOME CALCULATIONS ============
  
  // Calculate total income from all sources
  const totalIncome = useMemo(() => {
    // From Income module
    const incomeTotal = incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
    
    // From Rice Credit payments
    const riceCreditPaid = riceCredits?.reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    // From Bread Order payments
    const breadOrderPaid = breadOrders?.reduce((sum, o) => {
      const paid = o.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    // From Cash Loan payments
    const cashLoanPaid = cashLoans?.reduce((sum, l) => {
      const paid = l.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    // From Rental payments
    const rentalPaid = rentals?.reduce((sum, r) => {
      const paid = (r.down_payment || 0) + (r.remaining_balance || 0)
      return sum + paid
    }, 0) || 0
    
    return incomeTotal + riceCreditPaid + breadOrderPaid + cashLoanPaid + rentalPaid
  }, [incomes, riceCredits, breadOrders, cashLoans, rentals])

  // ============ EXPENSE CALCULATIONS ============
  
  const totalExpenses = useMemo(() => {
    // From Expense module
    const expenseTotal = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
    
    // From Rice Credit costs (puhunan)
    const riceCreditCost = riceCredits?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0
    
    // From Bread Order costs
    const breadOrderCost = breadOrders?.reduce((sum, o) => sum + (o.totalCost || 0), 0) || 0
    
    return expenseTotal + riceCreditCost + breadOrderCost
  }, [expenses, riceCredits, breadOrders])

  // ============ RECEIVABLES (Dapat kolektahin) ============
  
  const receivables = useMemo(() => {
    const riceCreditReceivable = riceCredits?.reduce((sum, t) => {
      if (t.status !== 'completed') {
        return sum + (t.remainingBalance || 0)
      }
      return sum
    }, 0) || 0
    
    const breadOrderReceivable = breadOrders?.reduce((sum, o) => {
      if (o.status !== 'completed') {
        return sum + (o.remainingBalance || 0)
      }
      return sum
    }, 0) || 0
    
    const cashLoanReceivable = cashLoans?.reduce((sum, l) => {
      if (l.status !== 'completed') {
        return sum + (l.remainingBalance || 0)
      }
      return sum
    }, 0) || 0
    
    return riceCreditReceivable + breadOrderReceivable + cashLoanReceivable
  }, [riceCredits, breadOrders, cashLoans])

  // ============ PAYABLES (Dapat bayaran) ============
  
  const payableTotals = getPayableTotals()
  const unpaidPayables = payableTotals.totalUnpaid || 0

  // ============ BUSINESS INCOME BREAKDOWN ============
  
  const businessIncome = useMemo(() => {
    const riceCreditIncome = riceCredits?.reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    const breadOrderIncome = breadOrders?.reduce((sum, o) => {
      const paid = o.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    const cashLoanIncome = cashLoans?.reduce((sum, l) => {
      const paid = l.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    const rentalIncome = rentals?.reduce((sum, r) => {
      const paid = (r.down_payment || 0) + (r.remaining_balance || 0)
      return sum + paid
    }, 0) || 0
    
    const incomeModule = incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
    
    return {
      riceCredit: riceCreditIncome,
      breadOrder: breadOrderIncome,
      cashLoan: cashLoanIncome,
      rental: rentalIncome,
      incomeModule: incomeModule
    }
  }, [riceCredits, breadOrders, cashLoans, rentals, incomes])

  // ============ BUSINESS PUHUNAN BREAKDOWN ============
  
  const businessPuhunan = useMemo(() => {
    const riceCreditCost = riceCredits?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0
    const breadOrderCost = breadOrders?.reduce((sum, o) => sum + (o.totalCost || 0), 0) || 0
    const expenseModule = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
    
    return {
      riceCredit: riceCreditCost,
      breadOrder: breadOrderCost,
      expenses: expenseModule
    }
  }, [riceCredits, breadOrders, expenses])

  // ============ BUSINESS PROFIT ============
  
  const businessProfit = useMemo(() => {
    return {
      riceCredit: businessIncome.riceCredit - businessPuhunan.riceCredit,
      breadOrder: businessIncome.breadOrder - businessPuhunan.breadOrder,
      cashLoan: businessIncome.cashLoan,
      rental: businessIncome.rental,
      incomeModule: businessIncome.incomeModule - businessPuhunan.expenses
    }
  }, [businessIncome, businessPuhunan])

  // ============ WEEKLY & MONTHLY INCOME ============
  
  const getIncomeByDateRange = (items, dateField = 'createdAt') => {
    return items?.filter(item => {
      if (!item[dateField]) return false
      const date = new Date(item[dateField])
      if (dateRange === 'week') {
        return isWithinInterval(date, { start: weekStart, end: weekEnd })
      }
      if (dateRange === 'month') {
        return isWithinInterval(date, { start: monthStart, end: monthEnd })
      }
      return true
    }).reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  }

  const weeklyIncome = useMemo(() => {
    const fromIncomes = getIncomeByDateRange(incomes)
    const fromRiceCredit = riceCredits?.filter(t => {
      const date = new Date(t.createdAt)
      return isWithinInterval(date, { start: weekStart, end: weekEnd })
    }).reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    return fromIncomes + fromRiceCredit
  }, [incomes, riceCredits, weekStart, weekEnd, dateRange])

  const monthlyIncome = useMemo(() => {
    const fromIncomes = getIncomeByDateRange(incomes)
    const fromRiceCredit = riceCredits?.filter(t => {
      const date = new Date(t.createdAt)
      return isWithinInterval(date, { start: monthStart, end: monthEnd })
    }).reduce((sum, t) => {
      const paid = t.payments?.reduce((s, p) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0
    
    return fromIncomes + fromRiceCredit
  }, [incomes, riceCredits, monthStart, monthEnd, dateRange])

  // ============ NET PROFIT & CASH ON HAND ============
  
  const netProfit = totalIncome - totalExpenses
  const cashOnHand = netProfit - unpaidPayables

  // ============ NAVIGATION FUNCTIONS ============
  
  const handleCardClick = (path) => {
    navigate(path)
  }

  const businessCards = [
    {
      id: 'riceCredit',
      title: 'Rice Credit',
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      income: businessIncome.riceCredit,
      puhunan: businessPuhunan.riceCredit,
      profit: businessProfit.riceCredit,
      path: '/rice-credit'
    },
    {
      id: 'breadOrder',
      title: 'Bread Orders',
      icon: ShoppingBag,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      income: businessIncome.breadOrder,
      puhunan: businessPuhunan.breadOrder,
      profit: businessProfit.breadOrder,
      path: '/bread-orders'
    },
    {
      id: 'cashLoan',
      title: 'Cash Loans',
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      income: businessIncome.cashLoan,
      puhunan: 0,
      profit: businessProfit.cashLoan,
      path: '/cash-loans'
    },
    {
      id: 'rental',
      title: 'Car Rental',
      icon: Car,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      income: businessIncome.rental,
      puhunan: 0,
      profit: businessProfit.rental,
      path: '/car-rental'
    },
    {
      id: 'incomeModule',
      title: 'Other Income',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      income: businessIncome.incomeModule,
      puhunan: 0,
      profit: businessProfit.incomeModule,
      path: '/income'
    },
    {
      id: 'expenses',
      title: 'Expenses',
      icon: TrendingDown,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      income: 0,
      puhunan: businessPuhunan.expenses,
      profit: -businessPuhunan.expenses,
      path: '/expenses'
    }
  ]

  // ============ CHART DATA ============
  
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const incomeByMonth = {}
    const expenseByMonth = {}

    months.forEach(m => {
      incomeByMonth[m] = 0
      expenseByMonth[m] = 0
    })

    incomes?.forEach(inc => {
      if (!inc.isDeleted) {
        const date = new Date(inc.date || inc.createdAt)
        const month = months[date.getMonth()]
        incomeByMonth[month] = (incomeByMonth[month] || 0) + (inc.amount || 0)
      }
    })

    expenses?.forEach(exp => {
      if (!exp.isDeleted) {
        const date = new Date(exp.date || exp.createdAt)
        const month = months[date.getMonth()]
        expenseByMonth[month] = (expenseByMonth[month] || 0) + (exp.amount || 0)
      }
    })

    return { incomeByMonth, expenseByMonth }
  }

  const monthlyData = getMonthlyChartData()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: months.map(m => monthlyData.incomeByMonth[m] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: months.map(m => monthlyData.expenseByMonth[m] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        tension: 0.4
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

  const receivableData = {
    labels: ['Rice Credit', 'Bread Orders', 'Cash Loans'],
    datasets: [
      {
        data: [
          riceCredits?.reduce((sum, t) => t.status !== 'completed' ? sum + (t.remainingBalance || 0) : sum, 0) || 0,
          breadOrders?.reduce((sum, o) => o.status !== 'completed' ? sum + (o.remainingBalance || 0) : sum, 0) || 0,
          cashLoans?.reduce((sum, l) => l.status !== 'completed' ? sum + (l.remainingBalance || 0) : sum, 0) || 0
        ],
        backgroundColor: ['#3b82f6', '#eab308', '#22c55e'],
        borderColor: darkMode ? '#1f2937' : '#ffffff',
        borderWidth: 2
      }
    ]
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

  // Format currency
  const formatCurrency = (amount) => {
    return '₱' + (amount || 0).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-primary-500" />
            Wallet & Cash Flow
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete financial overview of your business
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Main Summary Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          onClick={() => handleCardClick('/income')}
          className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dateRange === 'week' ? 'This week' : dateRange === 'month' ? 'This month' : 'All time'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('/expenses')}
          className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Including all puhunan
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('/reports')}
          className={`card p-4 ${netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} cursor-pointer hover:shadow-lg transition-all`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              </div>
              <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Income - Expenses
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('/payables')}
          className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash on Hand</p>
              </div>
              <p className={`text-2xl font-bold mt-2 ${cashOnHand >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(cashOnHand)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Net Profit - Payables ({formatCurrency(unpaidPayables)})
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Receivables & Payables Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={() => handleCardClick('/due-dates')}
          className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Receivables (Dapat Kolektahin)</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {formatCurrency(receivables)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {riceCredits?.filter(t => t.status !== 'completed').length || 0} pending payments
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('/payables')}
          className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Payables (Dapat Bayaran)</p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                {formatCurrency(unpaidPayables)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {payables?.filter(p => p.status !== 'paid').length || 0} unpaid bills
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Business Breakdown Cards - Clickable */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
        Business Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessCards.map((business) => {
          const Icon = business.icon
          return (
            <div
              key={business.id}
              onClick={() => handleCardClick(business.path)}
              className={`card cursor-pointer hover:shadow-lg transition-all ${business.bgColor} ${business.borderColor} border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${business.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{business.title}</h3>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(business.income)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Puhunan</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(business.puhunan)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                  <p className={`text-sm font-bold ${business.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(business.profit)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly & Monthly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">This Week</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {formatCurrency(weeklyIncome)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd')}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">This Month</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {formatCurrency(monthlyIncome)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {format(monthStart, 'MMM dd')} - {format(monthEnd, 'MMM dd')}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Monthly Income vs Expenses
          </h4>
          <div className="h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Receivables Breakdown
          </h4>
          <div className="h-64">
            {receivables === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <p className="text-sm">No receivables</p>
              </div>
            ) : (
              <Doughnut data={receivableData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
