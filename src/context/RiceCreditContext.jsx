import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
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
  const { addLog } = useAudit()

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rice_credit')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
      showNotification('Failed to load transactions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const addTransaction = async (data) => {
    try {
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
        transaction_number: generateRiceCreditNumber(),
        customer_id: data.customerId ? parseInt(data.customerId) : null,
        customer_name: data.customerName || '',
        amount: totalAmount,
        cost: data.cost || 0,
        down_payment: downPayment,
        number_of_payments: numberOfPayments,
        payment_per_give: paymentPerGive,
        remaining_balance: remainingBalance,
        status: remainingBalance <= 0 ? 'completed' : 'active',
        due_date: data.dueDate || null,
        profit: totalAmount - (data.cost || 0),
        payments: initialPayments,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      const { data: inserted, error } = await supabase
        .from('rice_credit')
        .insert([newTransaction])
        .select()

      if (error) throw error

      setTransactions(prev => [inserted[0], ...prev])
      showNotification(`Transaction ${inserted[0].transaction_number} added!`, 'success')
      addLog('Created', 'Rice Credit', `Created transaction: ${inserted[0].transaction_number} for ₱${totalAmount}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding transaction:', error)
      showNotification('Failed to add transaction', 'error')
      return null
    }
  }

  const updateTransaction = async (id, data) => {
    try {
      const { data: updated, error } = await supabase
        .from('rice_credit')
        .update({
          customer_name: data.customerName,
          amount: data.amount,
          cost: data.cost || 0,
          down_payment: data.downPayment || 0,
          number_of_payments: data.numberOfPayments || 1,
          due_date: data.dueDate || null,
          description: data.description || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setTransactions(prev => prev.map(t => t.id === id ? updated[0] : t))
      showNotification('Transaction updated!', 'success')
      addLog('Updated', 'Rice Credit', `Updated transaction: ${updated[0]?.transaction_number || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating transaction:', error)
      showNotification('Failed to update transaction', 'error')
      return null
    }
  }

  const deleteTransaction = async (id) => {
    try {
      const transaction = transactions.find(t => t.id === id)
      const { error } = await supabase
        .from('rice_credit')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))
      showNotification('Transaction moved to trash', 'warning')
      addLog('Deleted', 'Rice Credit', `Soft deleted transaction: ${transaction?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showNotification('Failed to delete transaction', 'error')
    }
  }

  const restoreTransaction = async (id) => {
    try {
      const transaction = transactions.find(t => t.id === id)
      const { error } = await supabase
        .from('rice_credit')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadTransactions()
      showNotification('Transaction restored!', 'success')
      addLog('Restored', 'Rice Credit', `Restored transaction: ${transaction?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring transaction:', error)
      showNotification('Failed to restore transaction', 'error')
    }
  }

  const permanentDeleteTransaction = async (id) => {
    try {
      const transaction = transactions.find(t => t.id === id)
      const { error } = await supabase
        .from('rice_credit')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))
      showNotification('Transaction permanently deleted', 'error')
      addLog('Deleted', 'Rice Credit', `Permanently deleted transaction: ${transaction?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting transaction:', error)
      showNotification('Failed to permanently delete transaction', 'error')
    }
  }

  const addPayment = async (id, amount) => {
    try {
      const transaction = transactions.find(t => t.id === id)
      if (!transaction) {
        showNotification('Transaction not found', 'error')
        return null
      }

      const payments = [...(transaction.payments || [])]
      let newBalance = transaction.remaining_balance - amount

      payments.push({
        id: Date.now(),
        amount: amount,
        date: new Date().toISOString(),
        type: 'payment'
      })

      const status = newBalance <= 0 ? 'completed' : transaction.status

      const { data: updated, error } = await supabase
        .from('rice_credit')
        .update({
          remaining_balance: newBalance < 0 ? 0 : newBalance,
          payments: payments,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setTransactions(prev => prev.map(t => t.id === id ? updated[0] : t))
      addLog('Paid', 'Rice Credit', `Payment of ₱${amount} recorded for ${transaction.transaction_number}`)
      showNotification(`Payment recorded!`, 'success')
      return updated[0]
    } catch (error) {
      console.error('Error adding payment:', error)
      showNotification('Failed to record payment', 'error')
      return null
    }
  }

  const getTotals = () => {
    const active = transactions
    const totalAmount = active.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalCost = active.reduce((sum, t) => sum + (t.cost || 0), 0)
    const totalProfit = active.reduce((sum, t) => sum + (t.profit || 0), 0)
    const totalPaid = active.reduce((sum, t) => {
      const paid = (t.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, t) => sum + (t.remaining_balance || 0), 0)
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

  const getActiveTransactions = () => transactions.filter(t => !t.is_deleted)
  const getDeletedTransactions = () => transactions.filter(t => t.is_deleted)

  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    permanentDeleteTransaction,
    addPayment,
    getTotals,
    getActiveTransactions,
    getDeletedTransactions,
    refreshTransactions: loadTransactions
  }

  return (
    <RiceCreditContext.Provider value={value}>
      {children}
    </RiceCreditContext.Provider>
  )
}
