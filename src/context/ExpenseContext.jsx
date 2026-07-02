import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { generateExpenseNumber } from '../utils/transactionUtils'

const ExpenseContext = createContext()

export const useExpenses = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider')
  }
  return context
}

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    const saved = localStorage.getItem('expenses')
    if (saved) {
      setExpenses(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('expenses', JSON.stringify(expenses))
    }
  }, [expenses, loading])

  const addExpense = (data) => {
    const newExpense = {
      id: Date.now(),
      transactionNumber: generateExpenseNumber(),
      ...data,
      amount: parseFloat(data.amount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setExpenses(prev => [...prev, newExpense])
    showNotification(`Expense ${newExpense.transactionNumber} recorded!`, 'success')
    addLog('Created', 'Expense', `Recorded expense: ${newExpense.transactionNumber} - ${data.item} (₱${data.amount})`)
    return newExpense
  }

  const updateExpense = (id, data) => {
    const expense = expenses.find(e => e.id === id)
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, ...data, updatedAt: new Date().toISOString() }
        : expense
    ))
    showNotification('Expense updated!', 'success')
    addLog('Updated', 'Expense', `Updated expense: ${expense?.transactionNumber || 'Unknown'}`)
  }

  const deleteExpense = (id) => {
    const expense = expenses.find(e => e.id === id)
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, isDeleted: true, deletedAt: new Date().toISOString() }
        : expense
    ))
    showNotification('Expense moved to trash', 'warning')
    addLog('Deleted', 'Expense', `Soft deleted expense: ${expense?.transactionNumber || 'Unknown'}`)
  }

  const restoreExpense = (id) => {
    const expense = expenses.find(e => e.id === id)
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, isDeleted: false, deletedAt: null }
        : expense
    ))
    showNotification('Expense restored!', 'success')
    addLog('Restored', 'Expense', `Restored expense: ${expense?.transactionNumber || 'Unknown'}`)
  }

  const permanentDeleteExpense = (id) => {
    const expense = expenses.find(e => e.id === id)
    setExpenses(prev => prev.filter(expense => expense.id !== id))
    showNotification('Expense permanently deleted', 'error')
    addLog('Deleted', 'Expense', `Permanently deleted expense: ${expense?.transactionNumber || 'Unknown'}`)
  }

  const getActiveExpenses = () => {
    return expenses.filter(e => !e.isDeleted)
  }

  const getDeletedExpenses = () => {
    return expenses.filter(e => e.isDeleted)
  }

  const getTotals = () => {
    const active = getActiveExpenses()
    const totalAmount = active.reduce((sum, e) => sum + (e.amount || 0), 0)
    const count = active.length

    const byCategory = active.reduce((acc, e) => {
      const category = e.category || 'Other'
      acc[category] = (acc[category] || 0) + (e.amount || 0)
      return acc
    }, {})

    const byMonth = active.reduce((acc, e) => {
      const month = new Date(e.date || e.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (e.amount || 0)
      return acc
    }, {})

    return {
      totalAmount,
      count,
      byCategory,
      byMonth
    }
  }

  const value = {
    expenses: getActiveExpenses(),
    deletedExpenses: getDeletedExpenses(),
    allExpenses: expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    permanentDeleteExpense,
    getTotals,
    getActiveExpenses,
    getDeletedExpenses
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}
