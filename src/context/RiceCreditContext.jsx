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
      console.log('📝 Adding rice credit with data:', data)

      if (!data.customerId || !data.amount) {
        showNotification('Please select a customer and enter amount', 'error')
        return null
      }

      const totalAmount = parseFloat(data.amount) || 0
      const downPayment = parseFloat(data.downPayment) || 0
      const numberOfPayments = parseInt(data.numberOfPayments) || 1
      const remainingBalance = totalAmount - downPayment
      const paymentPerGive = numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance
      const cost = parseFloat(data.cost) || 0
      const profit = totalAmount - cost

      const initialPayments = downPayment > 0 ? [{
        id: Date.now(),
        amount: downPayment,
        date: new Date().toISOString(),
        type: 'downpayment'
      }] : []

      const newTransaction = {
        id: Date.now(),
        transaction_number: generateRiceCreditNumber(),
        customer_id: parseInt(data.customerId),
        customer_name: data.customerName || '',
        amount: totalAmount,
        cost: cost,
        down_payment: downPayment,
        number_of_payments: numberOfPayments,
        payment_per_give: paymentPerGive,
        remaining_balance: remainingBalance,
        status: remainingBalance <= 0 ? 'completed' : 'active',
        due_date: data.dueDate || null,
        profit: profit,
        payments: initialPayments,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      console.log('📤 Inserting rice credit:', newTransaction)

      const { data: inserted, error } = await supabase
        .from('rice_credit')
        .insert([newTransaction])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create transaction: ' + error.message, 'error')
        return null
      }

      console.log('✅ Rice credit created:', inserted[0])
      setTransactions(prev => [inserted[0], ...prev])
      showNotification(`Transaction ${inserted[0].transaction_number} created!`, 'success')
      addLog('Created', 'Rice Credit', `Created transaction: ${inserted[0].transaction_number} for ₱${totalAmount}`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding transaction:', error)
      showNotification('Failed to create transaction: ' + error.message, 'error')
      return null
    }
  }

  const updateTransaction = async (id, data) => {
    try {
      const transaction = transactions.find(t => t.id === id)
      if (!transaction) {
        showNotification('Transaction not found', 'error')
        return null
      }

      const totalAmount = parseFloat(data.amount) || transaction.amount
      const downPayment = parseFloat(data.downPayment) || transaction.down_payment || 0
      const numberOfPayments = parseInt(data.numberOfPayments) || transaction.number_of_payments || 1
      const remainingBalance = totalAmount - downPayment
      const paymentPerGive = numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance
      const cost = parseFloat(data.cost) || transaction.cost || 0
      const profit = totalAmount - cost

      const { data: updated, error } = await supabase
        .from('rice_credit')
        .update({
          customer_name: data.customerName || transaction.customer_name,
          amount: totalAmount,
          cost: cost,
          down_payment: downPayment,
          number_of_payments: numberOfPayments,
          payment_per_give: paymentPerGive,
          remaining_balance: remainingBalance,
          due_date: data.dueDate || transaction.due_date,
          profit: profit,
          description: data.description || transaction.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating transaction:', error)
        showNotification('Failed to update transaction', 'error')
        return null
      }

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

      if (amount > transaction.remaining_balance) {
        showNotification(`Amount exceeds remaining balance of ₱${transaction.remaining_balance}`, 'error')
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

      if (error) {
        console.error('Error adding payment:', error)
        showNotification('Failed to record payment', 'error')
        return null
      }

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
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalAmount: 0,
        totalCost: 0,
        totalProfit: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalDownPayments: 0,
        overdueCount: 0,
        completedCount: 0,
        activeCount: 0,
        totalTransactions: 0
      }
    }

    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalCost = transactions.reduce((sum, t) => sum + (t.cost || 0), 0)
    const totalProfit = transactions.reduce((sum, t) => sum + (t.profit || 0), 0)
    const totalPaid = transactions.reduce((sum, t) => {
      const paid = (t.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
      return sum + paid
    }, 0)
    const totalRemaining = transactions.reduce((sum, t) => sum + (t.remaining_balance || 0), 0)
    const totalDownPayments = transactions.reduce((sum, t) => sum + (t.down_payment || 0), 0)
    const overdueCount = transactions.filter(t => t.status === 'overdue').length || 0
    const completedCount = transactions.filter(t => t.status === 'completed').length || 0
    const activeCount = transactions.filter(t => t.status === 'active').length || 0

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
      totalTransactions: transactions.length || 0
    }
  }

  const getActiveTransactions = () => {
    return transactions && Array.isArray(transactions) ? transactions.filter(t => !t.is_deleted) : []
  }

  const getDeletedTransactions = () => {
    return transactions && Array.isArray(transactions) ? transactions.filter(t => t.is_deleted) : []
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
    getDeletedTransactions,
    refreshTransactions: loadTransactions
  }

  return (
    <RiceCreditContext.Provider value={value}>
      {children}
    </RiceCreditContext.Provider>
  )
}
