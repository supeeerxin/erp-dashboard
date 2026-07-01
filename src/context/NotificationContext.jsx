import React, { createContext, useState, useContext } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const newNotification = {
      id,
      message,
      type,
      duration
    }
    
    setNotifications(prev => [...prev, newNotification])

    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}