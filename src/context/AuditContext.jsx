import React, { createContext, useContext, useState, useEffect } from 'react'

const AuditContext = createContext()

export const useAudit = () => {
  const context = useContext(AuditContext)
  // Return dummy functions to prevent errors if no provider
  if (!context) {
    console.warn('useAudit used outside of AuditProvider, returning dummy functions')
    return {
      logs: [],
      loading: false,
      addLog: () => {},
      getLogs: () => [],
      clearLogs: () => {}
    }
  }
  return context
}

export const AuditProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('auditLogs')
    if (saved) {
      try {
        setLogs(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing audit logs:', e)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('auditLogs', JSON.stringify(logs))
    }
  }, [logs, loading])

  const addLog = (action, module, details, user = 'Admin') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user || 'Admin',
      action: action,
      module: module,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      createdAt: new Date().toISOString()
    }
    setLogs(prev => [newLog, ...prev].slice(0, 1000))
    return newLog
  }

  const getLogs = (filters = {}) => {
    let filtered = logs
    if (filters.module) {
      filtered = filtered.filter(log => log.module === filters.module)
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo))
    }
    return filtered
  }

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem('auditLogs')
  }

  const value = {
    logs,
    loading,
    addLog,
    getLogs,
    clearLogs
  }

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  )
}
