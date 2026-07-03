import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  // Hardcoded admin users
  const adminUsers = [
    {
      id: 1,
      name: 'Elora',
      username: 'elora',
      password: '202128',
      role: 'admin'
    },
    {
      id: 2,
      name: 'Xinia',
      username: 'xinia',
      password: '202128',
      role: 'admin'
    }
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = (username, password) => {
    // Check if username exists
    const userExists = adminUsers.find(u => u.username === username)
    
    if (!userExists) {
      addLog('Login Failed', 'Auth', `Username not found: ${username}`)
      return { success: false, message: 'Username not found. Please check your username.' }
    }

    // Check if password is correct
    const foundUser = adminUsers.find(u => u.username === username && u.password === password)
    
    if (!foundUser) {
      addLog('Login Failed', 'Auth', `Incorrect password for: ${username}`)
      return { success: false, message: 'Incorrect password. Please try again.' }
    }

    // Login successful
    const userData = {
      id: foundUser.id,
      name: foundUser.name,
      username: foundUser.username,
      role: foundUser.role
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    addLog('Login', 'Auth', `${foundUser.name} logged in`)
    showNotification(`Welcome back, ${foundUser.name}!`, 'success')
    return { success: true, user: userData }
  }

  const logout = () => {
    if (user) {
      addLog('Logout', 'Auth', `${user.name} logged out`)
    }
    localStorage.removeItem('user')
    setUser(null)
    showNotification('Logged out successfully', 'info')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    users: adminUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
