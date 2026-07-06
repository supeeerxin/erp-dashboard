import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
import { generateIncomeNumber } from '../utils/transactionUtils'

const IncomeContext = createContext()

export const useIncome = () => {
  const context = useContext(IncomeContext)
  if (!context) {
    throw new Error('useIncome must be used within IncomeProvider')
  }
  return context
}

export const IncomeProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  const loadIncomes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIncomes(data || [])
    } catch (error) {
      console.error('Error loading incomes:', error)
      showNotification('Failed to load incomes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncomes()
  }, [])

  const addIncome = async (data) => {
    try {
      console.log('📝 Adding income with data:', data)

      // Validate required fields
      if (!data.source || !data.amount) {
        showNotification('Please enter source and amount', 'error')
        return null
      }

      const newIncome = {
        id: Date.now(),
        transaction_number: generateIncomeNumber(),
        source: data.source || '',
        category: data.category || 'Sales',
        amount: parseFloat(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      console.log('📤 Inserting to Supabase:', newIncome)

      const { data: inserted, error } = await supabase
        .from('income')
        .insert([newIncome])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create income: ' + error.message, 'error')
        return null
      }

      console.log('✅ Income created:', inserted[0])
      setIncomes(prev => [inserted[0], ...prev])
      showNotification(`Income ${inserted[0].transaction_number} recorded!`, 'success')
      addLog('Created', 'Income', `Recorded income: ${inserted[0].transaction_number} - ${data.source} (₱${data.amount})`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding income:', error)
      showNotification('Failed to create income: ' + error.message, 'error')
      return null
    }
  }

  const updateIncome = async (id, data) => {
    try {
      const income = incomes.find(i => i.id === id)
      if (!income) {
        showNotification('Income not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('income')
        .update({
          source: data.source || income.source,
          category: data.category || income.category,
          amount: parseFloat(data.amount) || income.amount,
          date: data.date || income.date,
          description: data.description || income.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating income:', error)
        showNotification('Failed to update income', 'error')
        return null
      }

      setIncomes(prev => prev.map(i => i.id === id ? updated[0] : i))
      showNotification('Income updated!', 'success')
      addLog('Updated', 'Income', `Updated income: ${updated[0]?.transaction_number || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating income:', error)
      showNotification('Failed to update income', 'error')
      return null
    }
  }

  const deleteIncome = async (id) => {
    try {
      const income = incomes.find(i => i.id === id)
      const { error } = await supabase
        .from('income')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setIncomes(prev => prev.filter(i => i.id !== id))
      showNotification('Income moved to trash', 'warning')
      addLog('Deleted', 'Income', `Soft deleted income: ${income?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting income:', error)
      showNotification('Failed to delete income', 'error')
    }
  }

  const restoreIncome = async (id) => {
    try {
      const income = incomes.find(i => i.id === id)
      const { error } = await supabase
        .from('income')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadIncomes()
      showNotification('Income restored!', 'success')
      addLog('Restored', 'Income', `Restored income: ${income?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring income:', error)
      showNotification('Failed to restore income', 'error')
    }
  }

  const permanentDeleteIncome = async (id) => {
    try {
      const income = incomes.find(i => i.id === id)
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)

      if (error) throw error

      setIncomes(prev => prev.filter(i => i.id !== id))
      showNotification('Income permanently deleted', 'error')
      addLog('Deleted', 'Income', `Permanently deleted income: ${income?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting income:', error)
      showNotification('Failed to permanently delete income', 'error')
    }
  }

  const getTotals = () => {
    if (!incomes || !Array.isArray(incomes)) {
      return {
        totalAmount: 0,
        count: 0,
        byCategory: {},
        byMonth: {}
      }
    }

    const totalAmount = incomes.reduce((sum, i) => sum + (i.amount || 0), 0)
    const count = incomes.length || 0

    const byCategory = incomes.reduce((acc, i) => {
      const category = i.category || 'Other'
      acc[category] = (acc[category] || 0) + (i.amount || 0)
      return acc
    }, {})

    const byMonth = incomes.reduce((acc, i) => {
      const month = new Date(i.date || i.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (i.amount || 0)
      return acc
    }, {})

    return {
      totalAmount,
      count,
      byCategory,
      byMonth
    }
  }

  const getActiveIncomes = () => incomes.filter(i => !i.is_deleted)
  const getDeletedIncomes = () => incomes.filter(i => i.is_deleted)

  const value = {
    incomes: getActiveIncomes(),
    deletedIncomes: getDeletedIncomes(),
    allIncomes: incomes,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    restoreIncome,
    permanentDeleteIncome,
    getTotals,
    getActiveIncomes,
    getDeletedIncomes,
    refreshIncomes: loadIncomes
  }

  return (
    <IncomeContext.Provider value={value}>
      {children}
    </IncomeContext.Provider>
  )
}
