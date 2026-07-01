import React from 'react'
import { useNotification } from '../../context/NotificationContext'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border ${getBgColor(notification.type)} shadow-lg animate-slide-in`}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast