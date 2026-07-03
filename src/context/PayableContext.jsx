import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
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
  const { addLog } = useAudit()

  useEffect(() => {
    const saved = localStorage.getItem('payables')
    if (saved) {
      setPayables(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
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
    showNotification(`Payable added: ${data.name}`, 'success')
    addLog('Created', 'Payable', `Added payable: ${data.name} (₱${data.amount}) - ${data.category}`)
    return newPayable
  }

  const updatePayable = (id, data) => {
    const payable = payables.find(p => p.id === id)
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, ...data, updatedAt: new Date().toISOString() }
        : payable
    ))
    showNotification('Payable updated!', 'success')
    addLog('Updated', 'Payable', `Updated payable: ${payable?.name || 'Unknown'}`)
  }

  const deletePayable = (id) => {
    const payable = payables.find(p => p.id === id)
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, isDeleted: true, deletedAt: new Date().toISOString() }
        : payable
    ))
    showNotification('Payable moved to trash', 'warning')
    addLog('Deleted', 'Payable', `Soft deleted payable: ${payable?.name || 'Unknown'}`)
  }

  const restorePayable = (id) => {
    const payable = payables.find(p => p.id === id)
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, isDeleted: false, deletedAt: null }
        : payable
    ))
    showNotification('Payable restored!', 'success')
    addLog('Restored', 'Payable', `Restored payable: ${payable?.name || 'Unknown'}`)
  }

  const permanentDeletePayable = (id) => {
    const payable = payables.find(p => p.id === id)
    setPayables(prev => prev.filter(payable => payable.id !== id))
    showNotification('Payable permanently deleted', 'error')
    addLog('Deleted', 'Payable', `Permanently deleted payable: ${payable?.name || 'Unknown'}`)
  }

  const markAsPaid = (id) => {
    const payable = payables.find(p => p.id === id)
    setPayables(prev => prev.map(payable =>
      payable.id === id
        ? { ...payable, status: 'paid', paidDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : payable
    ))
    showNotification(`Marked as paid: ${payable?.name}`, 'success')
    addLog('Paid', 'Payable', `Marked as paid: ${payable?.name} (₱${payable?.amount})`)
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

    const byCategory = active.reduce((acc, p) => {
      const category = p.category || 'Other'
      acc[category] = (acc[category] || 0) + (p.amount || 0)
      return acc
    }, {})

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
