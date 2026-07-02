import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { generateRiceCreditNumber } from '../utils/transactionUtils'

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

  const addTransaction = (data) => {
    const totalAmount = data.amount
    const downPayment = data.downPayment || 0
    const numberOfPayments = data.numberOfPayments || 1
    const remainingBalance = totalAmount - downPayment
    const paymentPerGive = numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance

    const initialPayments = downPayment > 0 ? [{
      id: Date.now(),
      amount: downPayment,
      date: new Date().toISOString(),
      type: 'downpayment'
    }] : []

    const newTransaction = {
      id: Date.now(),
      transactionNumber: generateRiceCreditNumber(), // Add unique transaction number
      ...data,
      downPayment: downPayment,
      numberOfPayments: numberOfPayments,
      paymentPerGive: paymentPerGive,
      remainingBalance: remainingBalance,
      status: remainingBalance <= 0 ? 'completed' : 'active',
      payments: initialPayments,
      profit: data.amount - (data.cost || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setTransactions(prev => [...prev, newTransaction])
    showNotification(`Transaction ${newTransaction.transactionNumber} added!`, 'success')
    return newTransaction
  }

  const updateTransaction = (id, data) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === id) {
        const totalAmount = data.amount || transaction.amount
        const downPayment = data.downPayment || transaction.downPayment || 0
        const numberOfPayments = data.numberOfPayments || transaction.numberOfPayments || 1
        const remainingBalance = totalAmount - downPayment
        
        let payments = transaction.payments || []
        if (downPayment > 0 && payments.length === 0) {
          payments = [{
            id: Date.now(),
            amount: downPayment,
            date: new Date().toISOString(),
            type: 'downpayment'
          }]
        }

        const updated = { 
          ...transaction, 
          ...data,
          downPayment: downPayment,
          numberOfPayments: numberOfPayments,
          paymentPerGive: numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance,
          remainingBalance: remainingBalance,
          payments: payments,
          profit: totalAmount - (data.cost || transaction.cost || 0),
          updatedAt: new Date().toISOString() 
        }
        return updated
      }
      return transaction
    }))
    showNotification('Transaction updated!', 'success')
  }

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === id
        ? { ...transaction, isDeleted: true, deletedAt: new Date().toISOString() }
        : transaction
    ))
    showNotification('Transaction moved to trash', 'warning')
  }

  const restoreTransaction = (id) => {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === id
        ? { ...transaction, isDeleted: false, deletedAt: null }
        : transaction
    ))
    showNotification('Transaction restored!', 'success')
  }

  const permanentDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id))
    showNotification('Transaction permanently deleted', 'error')
  }

  const addPayment = (id, amount) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === id) {
        let newBalance = transaction.remainingBalance - amount
        
        if (newBalance <= 0) {
          newBalance = 0
          const payments = [...(transaction.payments || []), {
            id: Date.now(),
            amount: transaction.remainingBalance,
            date: new Date().toISOString(),
            type: 'payment'
          }]
          return {
            ...transaction,
            payments,
            remainingBalance: 0,
            status: 'completed',
            updatedAt: new Date().toISOString()
          }
        }
        
        const payments = [...(transaction.payments || []), {
          id: Date.now(),
          amount,
          date: new Date().toISOString(),
          type: 'payment'
        }]
        
        return {
          ...transaction,
          payments,
          remainingBalance: newBalance,
          updatedAt: new Date().toISOString()
        }
      }
      return transaction
    }))
    showNotification(`Payment recorded!`, 'success')
  }

  const getActiveTransactions = () => {
    return transactions.filter(t => !t.isDeleted)
  }

  const getDeletedTransactions = () => {
    return transactions.filter(t => t.isDeleted)
  }

  const getTotals = () => {
    const active = getActiveTransactions()
    const totalAmount = active.reduce((sum, t) => sum + t.amount, 0)
    const totalCost = active.reduce((sum, t) => sum + (t.cost || 0), 0)
    const totalProfit = active.reduce((sum, t) => sum + (t.profit || 0), 0)
    const totalPaid = active.reduce((sum, t) => {
      const paid = (t.payments || []).reduce((s, p) => s + p.amount, 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, t) => sum + t.remainingBalance, 0)
    const totalDownPayments = active.reduce((sum, t) => sum + (t.downPayment || 0), 0)
    const overdueCount = active.filter(t => t.status === 'overdue').length
    const completedCount = active.filter(t => t.status === 'completed').length
    const activeCount = active.filter(t => t.status === 'active').length

    return {
      totalAmount,
      totalCost,
      totalProfit,
      totalPaid,
      totalRemaining,
      totalDownPayments,
      overdueCount,
      completedCount,
      activeCount,
      totalTransactions: active.length
    }
  }

  useEffect(() => {
    if (!loading) {
      setTransactions(prev => prev.map(transaction => {
        if (transaction.status === 'completed' && transaction.remainingBalance > 0) {
          return {
            ...transaction,
            remainingBalance: 0
          }
        }
        return transaction
      }))
    }
  }, [loading])

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
