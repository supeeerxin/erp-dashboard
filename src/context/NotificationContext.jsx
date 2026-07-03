import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    // Return dummy functions to prevent errors
    return {
      notifications: [],
      showNotification: () => {},
      removeNotification: () => {},
      clearAll: () => {}
    }
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
