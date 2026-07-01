import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'

const RiceCreditContext = createContext()

export const useRiceCredit = () => {
  const context = useContext(RiceCreditContext)
  if (!context) {
    throw new Error('useRiceCredit must be used within RiceCreditProvider')
  }
  return context
}

export const RiceCreditProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    const saved = localStorage.getItem('riceCreditTransactions')
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('riceCreditTransactions', JSON.stringify(transactions))
    }
  }, [transactions, loading])

  // Add transaction
  const addTransaction = (data) => {
    const newTransaction = {
      id: Date.now(),
      ...data,
      status: 'active',
      remainingBalance: data.amount,
      payments: [],
      profit: data.amount - (data.cost || 0), // Compute profit
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTransactions(prev => [...prev, newTransaction])
    showNotification('Rice credit transaction added!', 'success')
    return newTransaction
  }

  // Update transaction
  const updateTransaction = (id, data) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === id) {
        const updated = { 
          ...transaction, 
          ...data, 
          updatedAt: new Date().toISOString() 
        }
        // Recompute profit
        updated.profit = updated.amount - (updated.cost || 0)
        return updated
      }
      return transaction
    }))
    showNotification('Transaction updated!', 'success')
  }

  // Delete transaction (soft delete)
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === id
        ? { ...transaction, isDeleted: true, deletedAt: new Date().toISOString() }
        : transaction
    ))
    showNotification('Transaction moved to trash', 'warning')
  }

  // Restore transaction
  const restoreTransaction = (id) => {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === id
        ? { ...transaction, isDeleted: false, deletedAt: null }
        : transaction
    ))
    showNotification('Transaction restored!', 'success')
  }

  // Permanent delete
  const permanentDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id))
    showNotification('Transaction permanently deleted', 'error')
  }

  // Add payment
  const addPayment = (id, amount) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === id) {
        const newBalance = transaction.remainingBalance - amount
        const payments = [...transaction.payments, {
          id: Date.now(),
          amount,
          date: new Date().toISOString()
        }]
        const status = newBalance <= 0 ? 'completed' : transaction.status
        return {
          ...transaction,
          payments,
          remainingBalance: newBalance < 0 ? 0 : newBalance,
          status,
          updatedAt: new Date().toISOString()
        }
      }
      return transaction
    }))
    showNotification(`Payment of ₱${amount.toLocaleString()} recorded!`, 'success')
  }

  // Get active transactions
  const getActiveTransactions = () => {
    return transactions.filter(t => !t.isDeleted)
  }

  // Get deleted transactions
  const getDeletedTransactions = () => {
    return transactions.filter(t => t.isDeleted)
  }

  // Calculate totals
  const getTotals = () => {
    const active = getActiveTransactions()
    const totalAmount = active.reduce((sum, t) => sum + t.amount, 0)
    const totalCost = active.reduce((sum, t) => sum + (t.cost || 0), 0)
    const totalProfit = active.reduce((sum, t) => sum + (t.profit || 0), 0)
    const totalPaid = active.reduce((sum, t) => {
      const paid = t.payments.reduce((s, p) => s + p.amount, 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, t) => sum + t.remainingBalance, 0)
    const overdueCount = active.filter(t => t.status === 'overdue').length
    const completedCount = active.filter(t => t.status === 'completed').length
    const activeCount = active.filter(t => t.status === 'active').length

    return {
      totalAmount,
      totalCost,
      totalProfit,
      totalPaid,
      totalRemaining,
      overdueCount,
      completedCount,
      activeCount,
      totalTransactions: active.length
    }
  }

  const value = {
    transactions: getActiveTransactions(),
    deletedTransactions: getDeletedTransactions(),
    allTransactions: transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    permanentDeleteTransaction,
    addPayment,
    getTotals,
    getActiveTransactions,
    getDeletedTransactions
  }

  return (
    <RiceCreditContext.Provider value={value}>
      {children}
    </RiceCreditContext.Provider>
  )
}
