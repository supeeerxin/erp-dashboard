import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  Settings,
  X,
  LogOut,
  CreditCard,
  FileText,
  Calendar,
  Car
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth()

  const menuGroups = [
    {
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/due-dates', icon: Calendar, label: 'Due Dates' },
      ]
    },
    {
      items: [
        { path: '/vehicles', icon: Car, label: 'Vehicles' },  // <-- ADDED
        { path: '/rice-credit', icon: Package, label: 'Rice Credit' },
        { path: '/cash-loans', icon: DollarSign, label: 'Cash Loans' },
        { path: '/bread-orders', icon: ShoppingBag, label: 'Bread Orders' },
        { path: '/customers', icon: Users, label: 'Customers' },
      ]
    },
    {
      items: [
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/payables', icon: CreditCard, label: 'Payables' },
        { path: '/wallet', icon: Wallet, label: 'Wallet' },
      ]
    },
    {
      items: [
        { path: '/reports', icon: BarChart3, label: 'Reports' },
        { path: '/audit-log', icon: FileText, label: 'Audit Log' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">ERP System</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
