import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
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
  const { addLog } = useAudit()

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
      showNotification('Failed to load expenses', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const addExpense = async (data) => {
    try {
      console.log('📝 Adding expense with data:', data)

      const newExpense = {
        id: Date.now(),
        transaction_number: generateExpenseNumber(),
        item: data.item || '',
        category: data.category || 'Supplies',
        amount: parseFloat(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create expense: ' + error.message, 'error')
        return null
      }

      console.log('✅ Expense created:', inserted[0])
      setExpenses(prev => [inserted[0], ...prev])
      showNotification(`Expense ${inserted[0].transaction_number} recorded!`, 'success')
      addLog('Created', 'Expense', `Recorded expense: ${inserted[0].transaction_number} - ${data.item} (₱${data.amount})`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding expense:', error)
      showNotification('Failed to create expense: ' + error.message, 'error')
      return null
    }
  }

  const updateExpense = async (id, data) => {
    try {
      const expense = expenses.find(e => e.id === id)
      if (!expense) {
        showNotification('Expense not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('expenses')
        .update({
          item: data.item || expense.item,
          category: data.category || expense.category,
          amount: parseFloat(data.amount) || expense.amount,
          date: data.date || expense.date,
          description: data.description || expense.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating expense:', error)
        showNotification('Failed to update expense', 'error')
        return null
      }

      setExpenses(prev => prev.map(e => e.id === id ? updated[0] : e))
      showNotification('Expense updated!', 'success')
      addLog('Updated', 'Expense', `Updated expense: ${updated[0]?.transaction_number || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating expense:', error)
      showNotification('Failed to update expense', 'error')
      return null
    }
  }

  const deleteExpense = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id)
      const { error } = await supabase
        .from('expenses')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setExpenses(prev => prev.filter(e => e.id !== id))
      showNotification('Expense moved to trash', 'warning')
      addLog('Deleted', 'Expense', `Soft deleted expense: ${expense?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting expense:', error)
      showNotification('Failed to delete expense', 'error')
    }
  }

  const restoreExpense = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id)
      const { error } = await supabase
        .from('expenses')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadExpenses()
      showNotification('Expense restored!', 'success')
      addLog('Restored', 'Expense', `Restored expense: ${expense?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring expense:', error)
      showNotification('Failed to restore expense', 'error')
    }
  }

  const permanentDeleteExpense = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id)
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExpenses(prev => prev.filter(e => e.id !== id))
      showNotification('Expense permanently deleted', 'error')
      addLog('Deleted', 'Expense', `Permanently deleted expense: ${expense?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting expense:', error)
      showNotification('Failed to permanently delete expense', 'error')
    }
  }

  const getTotals = () => {
    if (!expenses || !Array.isArray(expenses)) {
      return {
        totalAmount: 0,
        count: 0,
        byCategory: {},
        byMonth: {}
      }
    }

    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const count = expenses.length || 0

    const byCategory = expenses.reduce((acc, e) => {
      const category = e.category || 'Other'
      acc[category] = (acc[category] || 0) + (e.amount || 0)
      return acc
    }, {})

    const byMonth = expenses.reduce((acc, e) => {
      const month = new Date(e.date || e.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
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

  const getActiveExpenses = () => expenses.filter(e => !e.is_deleted)
  const getDeletedExpenses = () => expenses.filter(e => e.is_deleted)

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
    getDeletedExpenses,
    refreshExpenses: loadExpenses
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}
