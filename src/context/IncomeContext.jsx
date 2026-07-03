import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
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

  useEffect(() => {
    const saved = localStorage.getItem('incomes')
    if (saved) {
      setIncomes(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('incomes', JSON.stringify(incomes))
    }
  }, [incomes, loading])

  const addIncome = (data) => {
    const newIncome = {
      id: Date.now(),
      transactionNumber: generateIncomeNumber(),
      ...data,
      amount: parseFloat(data.amount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setIncomes(prev => [...prev, newIncome])
    showNotification(`Income ${newIncome.transactionNumber} recorded!`, 'success')
    addLog('Created', 'Income', `Recorded income: ${newIncome.transactionNumber} - ${data.source} (₱${data.amount})`)
    return newIncome
  }

  const updateIncome = (id, data) => {
    const income = incomes.find(i => i.id === id)
    setIncomes(prev => prev.map(income =>
      income.id === id
        ? { ...income, ...data, updatedAt: new Date().toISOString() }
        : income
    ))
    showNotification('Income updated!', 'success')
    addLog('Updated', 'Income', `Updated income: ${income?.transactionNumber || 'Unknown'}`)
  }

  const deleteIncome = (id) => {
    const income = incomes.find(i => i.id === id)
    setIncomes(prev => prev.map(income =>
      income.id === id
        ? { ...income, isDeleted: true, deletedAt: new Date().toISOString() }
        : income
    ))
    showNotification('Income moved to trash', 'warning')
    addLog('Deleted', 'Income', `Soft deleted income: ${income?.transactionNumber || 'Unknown'}`)
  }

  const restoreIncome = (id) => {
    const income = incomes.find(i => i.id === id)
    setIncomes(prev => prev.map(income =>
      income.id === id
        ? { ...income, isDeleted: false, deletedAt: null }
        : income
    ))
    showNotification('Income restored!', 'success')
    addLog('Restored', 'Income', `Restored income: ${income?.transactionNumber || 'Unknown'}`)
  }

  const permanentDeleteIncome = (id) => {
    const income = incomes.find(i => i.id === id)
    setIncomes(prev => prev.filter(income => income.id !== id))
    showNotification('Income permanently deleted', 'error')
    addLog('Deleted', 'Income', `Permanently deleted income: ${income?.transactionNumber || 'Unknown'}`)
  }

  const getActiveIncomes = () => {
    return incomes.filter(i => !i.isDeleted)
  }

  const getDeletedIncomes = () => {
    return incomes.filter(i => i.isDeleted)
  }

  const getTotals = () => {
    const active = getActiveIncomes()
    const totalAmount = active.reduce((sum, i) => sum + (i.amount || 0), 0)
    const count = active.length

    const byCategory = active.reduce((acc, i) => {
      const category = i.category || 'Other'
      acc[category] = (acc[category] || 0) + (i.amount || 0)
      return acc
    }, {})

    const byMonth = active.reduce((acc, i) => {
      const month = new Date(i.date || i.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
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
    getDeletedIncomes
  }

  return (
    <IncomeContext.Provider value={value}>
      {children}
    </IncomeContext.Provider>
  )
}
