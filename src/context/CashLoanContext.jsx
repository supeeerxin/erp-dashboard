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
        customer_id: data.customerId,
        customer_name: data.customerName,
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

  const value = {
    loans,
    loading,
    addLoan,
    addPayment,
    refreshLoans: loadLoans
  }

  return (
    <CashLoanContext.Provider value={value}>
      {children}
    </CashLoanContext.Provider>
  )
}
