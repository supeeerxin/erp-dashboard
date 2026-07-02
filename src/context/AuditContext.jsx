import React, { createContext, useContext, useState, useEffect } from 'react'

const AuditContext = createContext()

export const useAudit = () => {
  const context = useContext(AuditContext)
  // Return dummy functions instead of throwing error
  if (!context) {
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
      setLogs(JSON.parse(saved))
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
      user,
      action,
      module,
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
