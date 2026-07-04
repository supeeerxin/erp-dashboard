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
        customer_id: data.customerId,
        customer_name: data.customerName,
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

  // ... other CRUD functions (update, delete, restore, etc.)

  const value = {
    transactions,
    loading,
    addTransaction,
    addPayment,
    refreshTransactions: loadTransactions
  }

  return (
    <RiceCreditContext.Provider value={value}>
      {children}
    </RiceCreditContext.Provider>
  )
}
