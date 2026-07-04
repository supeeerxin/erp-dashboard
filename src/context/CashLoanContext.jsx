import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
import { generateLoanNumber } from '../utils/transactionUtils'

const CashLoanContext = createContext()

export const useCashLoans = () => {
  const context = useContext(CashLoanContext)
  if (!context) {
    throw new Error('useCashLoans must be used within CashLoanProvider')
  }
  return context
}

export const CashLoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  const loadLoans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cash_loans')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLoans(data || [])
    } catch (error) {
      console.error('Error loading loans:', error)
      showNotification('Failed to load loans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLoans()
  }, [])

  const addLoan = async (data) => {
    try {
      const principal = data.principal
      const interestRate = data.interestRate || 0
      const interestType = data.interestType || 'fixed'
      const interestAmount = interestType === 'percentage' 
        ? (principal * interestRate / 100) 
        : interestRate
      
      const totalPayable = principal + interestAmount
      const downPayment = data.downPayment || 0
      const numberOfPayments = data.numberOfPayments || 1
      const remainingBalance = totalPayable - downPayment
      const paymentPerGive = numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance

      const initialPayments = downPayment > 0 ? [{
        id: Date.now(),
        amount: downPayment,
        date: new Date().toISOString(),
        type: 'downpayment'
      }] : []

      const newLoan = {
        id: Date.now(),
        transaction_number: generateLoanNumber(),
        customer_id: data.customerId ? parseInt(data.customerId) : null,
        customer_name: data.customerName || '',
        principal: principal,
        interest_rate: interestRate,
        interest_type: interestType,
        interest_amount: interestAmount,
        total_payable: totalPayable,
        down_payment: downPayment,
        number_of_payments: numberOfPayments,
        payment_per_give: paymentPerGive,
        remaining_balance: remainingBalance,
        status: remainingBalance <= 0 ? 'completed' : 'active',
        due_date: data.dueDate || null,
        payment_term: data.paymentTerm || 'months',
        term_value: data.termValue || 1,
        payments: initialPayments,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      const { data: inserted, error } = await supabase
        .from('cash_loans')
        .insert([newLoan])
        .select()

      if (error) throw error

      setLoans(prev => [inserted[0], ...prev])
      showNotification(`Loan ${inserted[0].transaction_number} created!`, 'success')
      addLog('Created', 'Cash Loan', `Created loan: ${inserted[0].transaction_number} for ₱${principal}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding loan:', error)
      showNotification('Failed to create loan', 'error')
      return null
    }
  }

  const updateLoan = async (id, data) => {
    try {
      const { data: updated, error } = await supabase
        .from('cash_loans')
        .update({
          customer_name: data.customerName,
          principal: data.principal,
          interest_rate: data.interestRate || 0,
          interest_type: data.interestType || 'fixed',
          down_payment: data.downPayment || 0,
          number_of_payments: data.numberOfPayments || 1,
          due_date: data.dueDate || null,
          payment_term: data.paymentTerm || 'months',
          term_value: data.termValue || 1,
          description: data.description || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setLoans(prev => prev.map(l => l.id === id ? updated[0] : l))
      showNotification('Loan updated!', 'success')
      addLog('Updated', 'Cash Loan', `Updated loan: ${updated[0]?.transaction_number || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating loan:', error)
      showNotification('Failed to update loan', 'error')
      return null
    }
  }

  const deleteLoan = async (id) => {
    try {
      const loan = loans.find(l => l.id === id)
      const { error } = await supabase
        .from('cash_loans')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setLoans(prev => prev.filter(l => l.id !== id))
      showNotification('Loan moved to trash', 'warning')
      addLog('Deleted', 'Cash Loan', `Soft deleted loan: ${loan?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting loan:', error)
      showNotification('Failed to delete loan', 'error')
    }
  }

  const restoreLoan = async (id) => {
    try {
      const loan = loans.find(l => l.id === id)
      const { error } = await supabase
        .from('cash_loans')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadLoans()
      showNotification('Loan restored!', 'success')
      addLog('Restored', 'Cash Loan', `Restored loan: ${loan?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring loan:', error)
      showNotification('Failed to restore loan', 'error')
    }
  }

  const permanentDeleteLoan = async (id) => {
    try {
      const loan = loans.find(l => l.id === id)
      const { error } = await supabase
        .from('cash_loans')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLoans(prev => prev.filter(l => l.id !== id))
      showNotification('Loan permanently deleted', 'error')
      addLog('Deleted', 'Cash Loan', `Permanently deleted loan: ${loan?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting loan:', error)
      showNotification('Failed to permanently delete loan', 'error')
    }
  }

  const addPayment = async (id, amount) => {
    try {
      const loan = loans.find(l => l.id === id)
      if (!loan) {
        showNotification('Loan not found', 'error')
        return null
      }

      const payments = [...(loan.payments || [])]
      let newBalance = loan.remaining_balance - amount

      payments.push({
        id: Date.now(),
        amount: amount,
        date: new Date().toISOString(),
        type: 'payment'
      })

      const status = newBalance <= 0 ? 'completed' : loan.status

      const { data: updated, error } = await supabase
        .from('cash_loans')
        .update({
          remaining_balance: newBalance < 0 ? 0 : newBalance,
          payments: payments,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setLoans(prev => prev.map(l => l.id === id ? updated[0] : l))
      addLog('Paid', 'Cash Loan', `Payment of ₱${amount} recorded for ${loan.transaction_number}`)
      showNotification(`Payment recorded!`, 'success')
      return updated[0]
    } catch (error) {
      console.error('Error adding payment:', error)
      showNotification('Failed to record payment', 'error')
      return null
    }
  }

  const getTotals = () => {
    // Safe check - if loans is undefined or not an array, return default values
    if (!loans || !Array.isArray(loans)) {
      return {
        totalPrincipal: 0,
        totalInterest: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        overdueCount: 0,
        completedCount: 0,
        activeCount: 0,
        totalLoans: 0
      }
    }

    const totalPrincipal = loans.reduce((sum, l) => sum + (l.principal || 0), 0)
    const totalInterest = loans.reduce((sum, l) => sum + (l.interest_amount || 0), 0)
    const totalPayable = loans.reduce((sum, l) => sum + (l.total_payable || 0), 0)
    const totalPaid = loans.reduce((sum, l) => {
      const paid = (l.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
      return sum + paid
    }, 0)
    const totalRemaining = loans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0)
    const overdueCount = loans.filter(l => l.status === 'overdue').length
    const completedCount = loans.filter(l => l.status === 'completed').length
    const activeCount = loans.filter(l => l.status === 'active').length

    return {
      totalPrincipal,
      totalInterest,
      totalPayable,
      totalPaid,
      totalRemaining,
      overdueCount,
      completedCount,
      activeCount,
      totalLoans: loans.length
    }
  }

  const getActiveLoans = () => {
    return loans && Array.isArray(loans) ? loans.filter(l => !l.is_deleted) : []
  }

  const getDeletedLoans = () => {
    return loans && Array.isArray(loans) ? loans.filter(l => l.is_deleted) : []
  }

  const value = {
    loans: getActiveLoans(),
    deletedLoans: getDeletedLoans(),
    allLoans: loans,
    loading,
    addLoan,
    updateLoan,
    deleteLoan,
    restoreLoan,
    permanentDeleteLoan,
    addPayment,
    getTotals,
    getActiveLoans,
    getDeletedLoans,
    refreshLoans: loadLoans
  }

  return (
    <CashLoanContext.Provider value={value}>
      {children}
    </CashLoanContext.Provider>
  )
}
