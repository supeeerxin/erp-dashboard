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
      console.log('📝 Adding loan with data:', data)

      // Validate required fields
      if (!data.customerId || !data.principal) {
        showNotification('Please select a customer and enter principal amount', 'error')
        return null
      }

      const principal = parseFloat(data.principal) || 0
      const interestRate = parseFloat(data.interestRate) || 0
      const interestType = data.interestType || 'fixed'
      const interestAmount = interestType === 'percentage' 
        ? (principal * interestRate / 100) 
        : interestRate
      
      const totalPayable = principal + interestAmount
      const downPayment = parseFloat(data.downPayment) || 0
      const numberOfPayments = parseInt(data.numberOfPayments) || 1
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
        customer_id: parseInt(data.customerId),
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
        term_value: parseInt(data.termValue) || 1,
        payments: initialPayments,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      console.log('📤 Inserting loan:', newLoan)

      const { data: inserted, error } = await supabase
        .from('cash_loans')
        .insert([newLoan])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create loan: ' + error.message, 'error')
        return null
      }

      console.log('✅ Loan created:', inserted[0])
      setLoans(prev => [inserted[0], ...prev])
      showNotification(`Loan ${inserted[0].transaction_number} created!`, 'success')
      addLog('Created', 'Cash Loan', `Created loan: ${inserted[0].transaction_number} for ₱${principal}`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding loan:', error)
      showNotification('Failed to create loan: ' + error.message, 'error')
      return null
    }
  }

  const updateLoan = async (id, data) => {
    try {
      const loan = loans.find(l => l.id === id)
      if (!loan) {
        showNotification('Loan not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('cash_loans')
        .update({
          customer_name: data.customerName || loan.customer_name,
          principal: parseFloat(data.principal) || loan.principal,
          interest_rate: parseFloat(data.interestRate) || loan.interest_rate,
          interest_type: data.interestType || loan.interest_type,
          down_payment: parseFloat(data.downPayment) || loan.down_payment,
          number_of_payments: parseInt(data.numberOfPayments) || loan.number_of_payments,
          due_date: data.dueDate || loan.due_date,
          payment_term: data.paymentTerm || loan.payment_term,
          term_value: parseInt(data.termValue) || loan.term_value,
          description: data.description || loan.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating loan:', error)
        showNotification('Failed to update loan', 'error')
        return null
      }

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

      if (amount > loan.remaining_balance) {
        showNotification(`Amount exceeds remaining balance of ₱${loan.remaining_balance}`, 'error')
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

      if (error) {
        console.error('Error adding payment:', error)
        showNotification('Failed to record payment', 'error')
        return null
      }

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
    const overdueCount = loans.filter(l => l.status === 'overdue').length || 0
    const completedCount = loans.filter(l => l.status === 'completed').length || 0
    const activeCount = loans.filter(l => l.status === 'active').length || 0

    return {
      totalPrincipal,
      totalInterest,
      totalPayable,
      totalPaid,
      totalRemaining,
      overdueCount,
      completedCount,
      activeCount,
      totalLoans: loans.length || 0
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
