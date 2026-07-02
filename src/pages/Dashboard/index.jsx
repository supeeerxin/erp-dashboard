import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingBag,
  Calendar,
  CreditCard,
  Wallet as WalletIcon
} from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import { useCustomers } from '../../context/CustomerContext'
import { useRiceCredit } from '../../context/RiceCreditContext'
import { useCashLoans } from '../../context/CashLoanContext'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useIncome } from '../../context/IncomeContext'
import { useExpenses } from '../../context/ExpenseContext'
import { usePayables } from '../../context/PayableContext'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import QuickActions from '../../components/dashboard/QuickActions'

const Dashboard = () => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [recentData, setRecentData] = useState([])
  const [chartData, setChartData] = useState({ labels: [], values: [] })

  // Get data from all contexts
  const { customers } = useCustomers()
  const { transactions: riceCreditTransactions } = useRiceCredit()
  const { loans: cashLoans } = useCashLoans()
  const { orders: breadOrders } = useBreadOrders()
  const { incomes } = useIncome()
  const { expenses } = useExpenses()
  const { payables } = usePayables()

  // Use useMemo to prevent unnecessary recalculations
  const totals = useMemo(() => {
    const totalCustomers = customers?.length || 0
    
    const totalRiceCredit = riceCreditTransactions?.reduce((sum, t) => sum + (t.totalSellingPrice || t.amount || 0), 0) || 0
    const totalBreadOrders = breadOrders?.reduce((sum, o) => sum + (o.totalSellingPrice || 0), 0) || 0
    const totalCashLoans = cashLoans?.reduce((sum, l) => sum + (l.totalPayable || l.principal || 0), 0) || 0
    
    const totalRevenue = totalRiceCredit + totalBreadOrders + totalCashLoans
    const totalIncome = incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
    const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
    const totalPayablesUnpaid = payables?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    
    const netProfit = (totalRevenue + totalIncome) - totalExpenses
    const cashOnHand = netProfit - totalPayablesUnpaid

    const activeRiceCredits = riceCreditTransactions?.filter(t => t.status === 'active').length || 0
    const activeCashLoans = cashLoans?.filter(l => l.status === 'active').length || 0
    const pendingOrders = breadOrders?.filter(o => o.status === 'pending').length || 0

    return {
      totalCustomers,
      totalRevenue,
      totalIncome,
      totalExpenses,
      totalPayablesUnpaid,
      netProfit,
      cashOnHand,
      activeRiceCredits,
      activeCashLoans,
      pendingOrders,
      riceCreditTransactions,
      cashLoans,
      breadOrders,
      incomes,
      expenses,
      payables
    }
  }, [customers, riceCreditTransactions, cashLoans, breadOrders, incomes, expenses, payables])

  // Prepare recent transactions and chart data
  useEffect(() => {
    const allTransactions = []

    // Rice Credit transactions
    totals.riceCreditTransactions?.forEach(t => {
      if (!t.isDeleted) {
        allTransactions.push({
          type: 'rice-credit',
          customer: t.customerName || 'Unknown',
          amount: t.amount || 0,
          status: t.status || 'active',
          date: t.createdAt || new Date().toISOString()
        })
      }
    })

    // Cash Loans
    totals.cashLoans?.forEach(l => {
      if (!l.isDeleted) {
        allTransactions.push({
          type: 'cash-loan',
          customer: l.customerName || 'Unknown',
          amount: l.principal || 0,
          status: l.status || 'active',
          date: l.createdAt || new Date().toISOString()
        })
      }
    })

    // Bread Orders
    totals.breadOrders?.forEach(o => {
      if (!o.isDeleted) {
        allTransactions.push({
          type: 'bread-order',
          customer: o.customerName || 'Unknown',
          amount: o.totalSellingPrice || 0,
          status: o.status || 'pending',
          date: o.createdAt || new Date().toISOString()
        })
      }
    })

    // Sort by date (most recent first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    setRecentData(allTransactions.slice(0, 10))

    // Prepare chart data (last 6 months)
    const months = []
    const values = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = month.toLocaleString('default', { month: 'short' })
      months.push(monthLabel)
      
      // Filter transactions for this month
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      
      const monthTotal = allTransactions.filter(t => {
        const date = new Date(t.date)
        return date >= monthStart && date <= monthEnd
      }).reduce((sum, t) => sum + (t.amount || 0), 0)
      
      values.push(monthTotal)
    }
    
    setChartData({ labels: months, values: values })
    
    // Only show notification once on first load
    if (loading) {
      setLoading(false)
      showNotification('Dashboard loaded!', 'success')
    }
  }, [totals.riceCreditTransactions, totals.cashLoans, totals.breadOrders, loading, showNotification])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-8 w-32"></div>
              <div className="skeleton h-4 w-20 mt-2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card">
            <div className="skeleton h-6 w-40 mb-4"></div>
            <div className="skeleton h-64 w-full"></div>
          </div>
          <div className="card">
            <div className="skeleton h-6 w-40 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-12 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₱${totals.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      subtitle: `${totals.activeRiceCredits + totals.activeCashLoans} active credits/loans`
    },
    {
      title: 'Net Profit',
      value: `₱${totals.netProfit.toLocaleString()}`,
      icon: WalletIcon,
      color: totals.netProfit >= 0 ? 'text-green-500' : 'text-red-500',
      subtitle: `Cash on Hand: ₱${totals.cashOnHand.toLocaleString()}`
    },
    {
      title: 'Total Customers',
      value: totals.totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-500',
      subtitle: `${totals.pendingOrders} pending orders`
    },
    {
      title: 'Unpaid Payables',
      value: `₱${totals.totalPayablesUnpaid.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-red-500',
      subtitle: `${totals.payables?.filter(p => p.status !== 'paid').length || 0} bills/loans due`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} label="Monthly Revenue" />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <RecentTransactions data={recentData} />
      </div>
    </div>
  )
}

export default Dashboard
