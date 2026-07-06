import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuditContext = createContext()

export const useAudit = () => {
  const context = useContext(AuditContext)
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

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        return user.name || user.username || 'Admin'
      }
    } catch (error) {
      console.error('Error getting current user:', error)
    }
    return 'Admin'
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const addLog = async (action, module, details, user = null) => {
    try {
      // Get current user - either from parameter or from localStorage
      const username = user || getCurrentUser()

      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        username: username,
        action: action,
        module: module,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        created_at: new Date().toISOString()
      }

      console.log(`📝 [${username}] ${action} - ${module}: ${details}`)

      const { data, error } = await supabase
        .from('audit_logs')
        .insert([newLog])
        .select()

      if (error) {
        console.error('❌ Error saving audit log to Supabase:', error)
        setLogs(prev => [newLog, ...prev].slice(0, 1000))
        return newLog
      }

      console.log('✅ Audit log saved:', data)
      setLogs(prev => [data[0], ...prev].slice(0, 1000))
      return data[0]
    } catch (error) {
      console.error('❌ Error in addLog:', error)
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        username: user || 'Admin',
        action: action,
        module: module,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        created_at: new Date().toISOString()
      }
      setLogs(prev => [newLog, ...prev].slice(0, 1000))
      return newLog
    }
  }

  const getLogs = (filters = {}) => {
    let filtered = logs
    if (filters.module) {
      filtered = filtered.filter(log => log.module === filters.module)
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }
    if (filters.username) {
      filtered = filtered.filter(log => log.username === filters.username)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo))
    }
    return filtered
  }

  const clearLogs = async () => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', 0)

      if (error) {
        console.error('Error clearing logs from Supabase:', error)
        setLogs([])
        return
      }

      setLogs([])
      console.log('✅ All audit logs cleared')
    } catch (error) {
      console.error('Error clearing logs:', error)
      setLogs([])
    }
  }

  const refreshLogs = async () => {
    await loadLogs()
  }

  const value = {
    logs,
    loading,
    addLog,
    getLogs,
    clearLogs,
    refreshLogs,
    getCurrentUser
  }

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  )
}
