import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { generateLoanNumber } from '../utils/transactionUtils'
import { isAfter, parseISO } from 'date-fns'

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

  useEffect(() => {
    const saved = localStorage.getItem('cashLoans')
    if (saved) {
      setLoans(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      // Check for overdue loans
      const updatedLoans = loans.map(loan => {
        if (loan.status === 'active' && loan.dueDate) {
          const dueDate = parseISO(loan.dueDate)
          if (isAfter(new Date(), dueDate)) {
            return { ...loan, status: 'overdue' }
          }
        }
        return loan
      })
      if (JSON.stringify(updatedLoans) !== JSON.stringify(loans)) {
        setLoans(updatedLoans)
      }
      localStorage.setItem('cashLoans', JSON.stringify(loans))
    }
  }, [loans, loading])

  const addLoan = (data) => {
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

    // Auto-compute due date if not provided
    let dueDate = data.dueDate
    if (!dueDate && data.termValue) {
      const today = new Date()
      const termValue = parseInt(data.termValue) || 1
      if (data.paymentTerm === 'months') {
        dueDate = new Date(today.setMonth(today.getMonth() + termValue)).toISOString().split('T')[0]
      } else if (data.paymentTerm === 'days') {
        dueDate = new Date(today.setDate(today.getDate() + termValue)).toISOString().split('T')[0]
      }
    }

    const newLoan = {
      id: Date.now(),
      transactionNumber: generateLoanNumber(),
      ...data,
      dueDate: dueDate || data.dueDate,
      interestAmount: interestAmount,
      totalPayable: totalPayable,
      downPayment: downPayment,
      numberOfPayments: numberOfPayments,
      paymentPerGive: paymentPerGive,
      remainingBalance: remainingBalance,
      status: remainingBalance <= 0 ? 'completed' : 'active',
      payments: initialPayments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setLoans(prev => [...prev, newLoan])
    showNotification(`Loan ${newLoan.transactionNumber} created!`, 'success')
    return newLoan
  }

  const updateLoan = (id, data) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id) {
        const updated = { ...loan, ...data, updatedAt: new Date().toISOString() }
        return updated
      }
      return loan
    }))
    showNotification('Loan updated!', 'success')
  }

  const deleteLoan = (id) => {
    setLoans(prev => prev.map(loan =>
      loan.id === id
        ? { ...loan, isDeleted: true, deletedAt: new Date().toISOString() }
        : loan
    ))
    showNotification('Loan moved to trash', 'warning')
  }

  const restoreLoan = (id) => {
    setLoans(prev => prev.map(loan =>
      loan.id === id
        ? { ...loan, isDeleted: false, deletedAt: null }
        : loan
    ))
    showNotification('Loan restored!', 'success')
  }

  const permanentDeleteLoan = (id) => {
    setLoans(prev => prev.filter(loan => loan.id !== id))
    showNotification('Loan permanently deleted', 'error')
  }

  const addPayment = (id, amount) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id) {
        let newBalance = loan.remainingBalance - amount
        
        if (newBalance <= 0) {
          newBalance = 0
          const payments = [...(loan.payments || []), {
            id: Date.now(),
            amount: loan.remainingBalance,
            date: new Date().toISOString(),
            type: 'payment'
          }]
          return {
            ...loan,
            payments,
            remainingBalance: 0,
            status: 'completed',
            updatedAt: new Date().toISOString()
          }
        }
        
        const payments = [...(loan.payments || []), {
          id: Date.now(),
          amount,
          date: new Date().toISOString(),
          type: 'payment'
        }]
        
        return {
          ...loan,
          payments,
          remainingBalance: newBalance,
          updatedAt: new Date().toISOString()
        }
      }
      return loan
    }))
    showNotification(`Payment recorded!`, 'success')
  }

  const getActiveLoans = () => {
    return loans.filter(l => !l.isDeleted)
  }

  const getDeletedLoans = () => {
    return loans.filter(l => l.isDeleted)
  }

  const getTotals = () => {
    const active = getActiveLoans()
    const totalPrincipal = active.reduce((sum, l) => sum + l.principal, 0)
    const totalInterest = active.reduce((sum, l) => sum + l.interestAmount, 0)
    const totalPayable = active.reduce((sum, l) => sum + l.totalPayable, 0)
    const totalPaid = active.reduce((sum, l) => {
      const paid = (l.payments || []).reduce((s, p) => s + p.amount, 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, l) => sum + l.remainingBalance, 0)
    const overdueCount = active.filter(l => l.status === 'overdue').length
    const completedCount = active.filter(l => l.status === 'completed').length
    const activeCount = active.filter(l => l.status === 'active').length

    return {
      totalPrincipal,
      totalInterest,
      totalPayable,
      totalPaid,
      totalRemaining,
      overdueCount,
      completedCount,
      activeCount,
      totalLoans: active.length
    }
  }

  useEffect(() => {
    if (!loading) {
      setLoans(prev => prev.map(loan => {
        if (loan.status === 'completed' && loan.remainingBalance > 0) {
          return { ...loan, remainingBalance: 0 }
        }
        return loan
      }))
    }
  }, [loading])

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
    getDeletedLoans
  }

  return (
    <CashLoanContext.Provider value={value}>
      {children}
    </CashLoanContext.Provider>
  )
}
