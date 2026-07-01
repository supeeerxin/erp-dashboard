import React from 'react'
import { 
  Plus, 
  CreditCard, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      icon: Plus,
      label: 'New Rice Credit',
      color: 'bg-blue-500',
      path: '/rice-credit'
    },
    {
      icon: CreditCard,
      label: 'New Cash Loan',
      color: 'bg-green-500',
      path: '/cash-loans'
    },
    {
      icon: ShoppingBag,
      label: 'New Bread Order',
      color: 'bg-yellow-500',
      path: '/bread-orders'
    },
    {
      icon: Users,
      label: 'Add Customer',
      color: 'bg-purple-500',
      path: '/customers'
    },
    {
      icon: TrendingUp,
      label: 'Add Income',
      color: 'bg-indigo-500',
      path: '/income'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
          >
            <div className={`${action.color} p-2 rounded-lg text-white`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
              {action.label}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
          <p className="text-sm font-medium">Quick Tip</p>
          <p className="text-xs opacity-90 mt-1">
            Use the search bar to quickly find customers and transactions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuickActions