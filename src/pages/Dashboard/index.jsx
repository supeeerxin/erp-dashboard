import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingBag,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import QuickActions from '../../components/dashboard/QuickActions'

const Dashboard = () => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)

  // Mock data - will be replaced with real data later
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-green-500'
    },
    {
      title: 'Total Expenses',
      value: '$12,543.00',
      change: '-5.2%',
      icon: TrendingDown,
      trend: 'down',
      color: 'text-red-500'
    },
    {
      title: 'Active Customers',
      value: '2,345',
      change: '+12.5%',
      icon: Users,
      trend: 'up',
      color: 'text-blue-500'
    },
    {
      title: 'Wallet Balance',
      value: '$32,688.89',
      change: '+8.7%',
      icon: DollarSign,
      trend: 'up',
      color: 'text-yellow-500'
    }
  ]

  const recentData = [
    { id: 1, customer: 'Juan Dela Cruz', amount: 2500, status: 'Paid', date: '2024-01-15' },
    { id: 2, customer: 'Maria Santos', amount: 1800, status: 'Pending', date: '2024-01-14' },
    { id: 3, customer: 'Pedro Reyes', amount: 3200, status: 'Overdue', date: '2024-01-13' },
    { id: 4, customer: 'Ana Garcia', amount: 1500, status: 'Paid', date: '2024-01-12' },
    { id: 5, customer: 'Ramon Cruz', amount: 2100, status: 'Pending', date: '2024-01-11' }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
      showNotification('Dashboard loaded successfully!', 'success')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
            Jan 2024
          </button>
          <button className="btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
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