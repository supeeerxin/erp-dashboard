import React, { useState } from 'react'
import { Menu, Search, Sun, Moon, Bell, User, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'

const Header = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user } = useAuth()
  const { notifications, removeNotification, clearAll } = useNotification()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Notifications ({notifications.length})
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearAll()
                        setShowNotifications(false)
                      }}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getNotificationColor(notification.type)}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatTime(notification.createdAt || notification.id)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
