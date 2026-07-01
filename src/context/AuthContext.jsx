import React, { createContext, useState, useContext, useEffect } from 'react'

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

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simple demo login - in production, this would validate against a backend
    if (email === 'admin@erp.com' && password === 'admin123') {
      const userData = {
        id: 1,
        name: 'Admin User',
        email: 'admin@erp.com',
        role: 'Administrator'
      }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}