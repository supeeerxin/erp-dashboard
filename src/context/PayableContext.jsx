import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
import { isAfter, parseISO } from 'date-fns'

const PayableContext = createContext()

export const usePayables = () => {
  const context = useContext(PayableContext)
  if (!context) {
    throw new Error('usePayables must be used within PayableProvider')
  }
  return context
}

export const PayableProvider = ({ children }) => {
  const [payables, setPayables] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  const loadPayables = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payables')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayables(data || [])
    } catch (error) {
      console.error('Error loading payables:', error)
      showNotification('Failed to load payables', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayables()
  }, [])

  // Check for overdue payables
  useEffect(() => {
    if (!loading) {
      const updatedPayables = payables.map(p => {
        if (p.status !== 'paid' && p.due_date) {
          const dueDate = parseISO(p.due_date)
          if (isAfter(new Date(), dueDate)) {
            return { ...p, status: 'overdue' }
          }
        }
        return p
      })
      if (JSON.stringify(updatedPayables) !== JSON.stringify(payables)) {
        setPayables(updatedPayables)
      }
    }
  }, [payables, loading])

  const addPayable = async (data) => {
    try {
      console.log('📝 Adding payable with data:', data)

      const newPayable = {
        id: Date.now(),
        name: data.name || '',
        category: data.category || 'Bills',
        amount: parseFloat(data.amount) || 0,
        due_date: data.dueDate || null,
        frequency: data.frequency || 'monthly',
        status: data.status || 'unpaid',
        description: data.description || '',
        paid_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      const { data: inserted, error } = await supabase
        .from('payables')
        .insert([newPayable])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create payable: ' + error.message, 'error')
        return null
      }

      console.log('✅ Payable created:', inserted[0])
      setPayables(prev => [inserted[0], ...prev])
      showNotification(`Payable added: ${data.name}`, 'success')
      addLog('Created', 'Payable', `Added payable: ${data.name} (₱${data.amount}) - ${data.category}`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding payable:', error)
      showNotification('Failed to create payable: ' + error.message, 'error')
      return null
    }
  }

  const updatePayable = async (id, data) => {
    try {
      const payable = payables.find(p => p.id === id)
      if (!payable) {
        showNotification('Payable not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('payables')
        .update({
          name: data.name || payable.name,
          category: data.category || payable.category,
          amount: parseFloat(data.amount) || payable.amount,
          due_date: data.dueDate || payable.due_date,
          frequency: data.frequency || payable.frequency,
          description: data.description || payable.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating payable:', error)
        showNotification('Failed to update payable', 'error')
        return null
      }

      setPayables(prev => prev.map(p => p.id === id ? updated[0] : p))
      showNotification('Payable updated!', 'success')
      addLog('Updated', 'Payable', `Updated payable: ${updated[0]?.name || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating payable:', error)
      showNotification('Failed to update payable', 'error')
      return null
    }
  }

  const deletePayable = async (id) => {
    try {
      const payable = payables.find(p => p.id === id)
      const { error } = await supabase
        .from('payables')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setPayables(prev => prev.filter(p => p.id !== id))
      showNotification('Payable moved to trash', 'warning')
      addLog('Deleted', 'Payable', `Soft deleted payable: ${payable?.name || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting payable:', error)
      showNotification('Failed to delete payable', 'error')
    }
  }

  const restorePayable = async (id) => {
    try {
      const payable = payables.find(p => p.id === id)
      const { error } = await supabase
        .from('payables')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadPayables()
      showNotification('Payable restored!', 'success')
      addLog('Restored', 'Payable', `Restored payable: ${payable?.name || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring payable:', error)
      showNotification('Failed to restore payable', 'error')
    }
  }

  const permanentDeletePayable = async (id) => {
    try {
      const payable = payables.find(p => p.id === id)
      const { error } = await supabase
        .from('payables')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPayables(prev => prev.filter(p => p.id !== id))
      showNotification('Payable permanently deleted', 'error')
      addLog('Deleted', 'Payable', `Permanently deleted payable: ${payable?.name || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting payable:', error)
      showNotification('Failed to permanently delete payable', 'error')
    }
  }

  const markAsPaid = async (id) => {
    try {
      const payable = payables.find(p => p.id === id)
      if (!payable) {
        showNotification('Payable not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('payables')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error marking payable as paid:', error)
        showNotification('Failed to mark as paid', 'error')
        return null
      }

      setPayables(prev => prev.map(p => p.id === id ? updated[0] : p))
      showNotification(`Marked as paid: ${payable.name}`, 'success')
      addLog('Paid', 'Payable', `Marked as paid: ${payable.name} (₱${payable.amount})`)
      return updated[0]
    } catch (error) {
      console.error('Error marking payable as paid:', error)
      showNotification('Failed to mark as paid', 'error')
      return null
    }
  }

  const getTotals = () => {
    if (!payables || !Array.isArray(payables)) {
      return {
        totalAmount: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        overdueCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        byCategory: {},
        byMonth: {},
        count: 0
      }
    }

    const totalAmount = payables.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalPaid = payables.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalUnpaid = payables.filter(p => p.status === 'unpaid' || p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0)
    const overdueCount = payables.filter(p => p.status === 'overdue').length || 0
    const paidCount = payables.filter(p => p.status === 'paid').length || 0
    const unpaidCount = payables.filter(p => p.status === 'unpaid').length || 0

    const byCategory = payables.reduce((acc, p) => {
      const category = p.category || 'Other'
      acc[category] = (acc[category] || 0) + (p.amount || 0)
      return acc
    }, {})

    const byMonth = payables.reduce((acc, p) => {
      const month = new Date(p.due_date || p.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (p.amount || 0)
      return acc
    }, {})

    return {
      totalAmount,
      totalPaid,
      totalUnpaid,
      overdueCount,
      paidCount,
      unpaidCount,
      byCategory,
      byMonth,
      count: payables.length || 0
    }
  }

  const getActivePayables = () => payables.filter(p => !p.is_deleted)
  const getDeletedPayables = () => payables.filter(p => p.is_deleted)

  const value = {
    payables: getActivePayables(),
    deletedPayables: getDeletedPayables(),
    allPayables: payables,
    loading,
    addPayable,
    updatePayable,
    deletePayable,
    restorePayable,
    permanentDeletePayable,
    markAsPaid,
    getTotals,
    getActivePayables,
    getDeletedPayables,
    refreshPayables: loadPayables
  }

  return (
    <PayableContext.Provider value={value}>
      {children}
    </PayableContext.Provider>
  )
}
