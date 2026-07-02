import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { isAfter, parseISO } from 'date-fns'

const PayableContext = createContext()

export const usePayables = () => {
  const context = useContext(PayableContext)
  if (!context) {
    throw new Error('usePayables must be used within PayableProvider')
  }
  return context
}

export const PayableProvider = ({ children }) => {
  const [payables, setPayables] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    const saved = localStorage.getItem('payables')
    if (saved) {
      setPayables(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      // Check for overdue payables
      const updatedPayables = payables.map(p => {
        if (p.status !== 'paid' && p.dueDate) {
          const dueDate = parseISO(p.dueDate)
          if (isAfter(new Date(), dueDate)) {
            return { ...p, status: 'overdue' }
          }
        }
        return p
      })
      if (JSON.stringify(updatedPayables) !== JSON.stringify(payables)) {
        setPayables(updatedPayables)
      }
      localStorage.setItem('payables', JSON.stringify(payables))
    }
  }, [payables, loading])

  const addPayable = (data) => {
    const newPayable = {
      id: Date.now(),
      ...data,
      amount: parseFloat(data.amount) || 0,
      status: data.status || 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setPayables(prev => [...prev, newPayable])
    showNotification('Payable added!', 'success')
    return newPayable
  }

  const updatePayable = (id, data) => {
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, ...data, updatedAt: new Date().toISOString() }
        : payable
    ))
    showNotification('Payable updated!', 'success')
  }

  const deletePayable = (id) => {
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, isDeleted: true, deletedAt: new Date().toISOString() }
        : payable
    ))
    showNotification('Payable moved to trash', 'warning')
  }

  const restorePayable = (id) => {
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, isDeleted: false, deletedAt: null }
        : payable
    ))
    showNotification('Payable restored!', 'success')
  }

  const permanentDeletePayable = (id) => {
    setPayables(prev => prev.filter(payable => payable.id !== id))
    showNotification('Payable permanently deleted', 'error')
  }

  const markAsPaid = (id) => {
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, status: 'paid', paidDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : payable
    ))
    showNotification('Marked as paid!', 'success')
  }

  const getActivePayables = () => {
    return payables.filter(p => !p.isDeleted)
  }

  const getDeletedPayables = () => {
    return payables.filter(p => p.isDeleted)
  }

  const getTotals = () => {
    const active = getActivePayables()
    const totalAmount = active.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalPaid = active.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalUnpaid = active.filter(p => p.status === 'unpaid' || p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0)
    const overdueCount = active.filter(p => p.status === 'overdue').length
    const paidCount = active.filter(p => p.status === 'paid').length
    const unpaidCount = active.filter(p => p.status === 'unpaid').length

    // Group by category
    const byCategory = active.reduce((acc, p) => {
      const category = p.category || 'Other'
      acc[category] = (acc[category] || 0) + (p.amount || 0)
      return acc
    }, {})

    // Group by month
    const byMonth = active.reduce((acc, p) => {
      const month = new Date(p.dueDate || p.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (p.amount || 0)
      return acc
    }, {})

    return {
      totalAmount,
      totalPaid,
      totalUnpaid,
      overdueCount,
      paidCount,
      unpaidCount,
      byCategory,
      byMonth,
      count: active.length
    }
  }

  const value = {
    payables: getActivePayables(),
    deletedPayables: getDeletedPayables(),
    allPayables: payables,
    loading,
    addPayable,
    updatePayable,
    deletePayable,
    restorePayable,
    permanentDeletePayable,
    markAsPaid,
    getTotals,
    getActivePayables,
    getDeletedPayables
  }

  return (
    <PayableContext.Provider value={value}>
      {children}
    </PayableContext.Provider>
  )
}
