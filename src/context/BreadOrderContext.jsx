import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'
import { generateOrderNumber } from '../utils/transactionUtils'

const BreadOrderContext = createContext()

export const useBreadOrders = () => {
  const context = useContext(BreadOrderContext)
  if (!context) {
    throw new Error('useBreadOrders must be used within BreadOrderProvider')
  }
  return context
}

export const BreadOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bread_orders')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      showNotification('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const addOrder = async (data) => {
    try {
      const boxes = data.boxes || 0
      const pieces = data.pieces || 0
      const sellingPricePerBox = data.sellingPricePerBox || 0
      const sellingPricePerPiece = data.sellingPricePerPiece || 0
      const costPerBox = data.costPerBox || 0
      const costPerPiece = data.costPerPiece || 0
      
      const totalSellingPrice = (boxes * sellingPricePerBox) + (pieces * sellingPricePerPiece)
      const totalCost = (boxes * costPerBox) + (pieces * costPerPiece)
      const profit = totalSellingPrice - totalCost

      const newOrder = {
        id: Date.now(),
        transaction_number: generateOrderNumber(),
        customer_id: data.customerId ? parseInt(data.customerId) : null,
        customer_name: data.customerName || '',
        product_id: data.productId ? parseInt(data.productId) : null,
        product_name: data.productName || '',
        boxes: boxes,
        pieces: pieces,
        selling_price_per_box: sellingPricePerBox,
        selling_price_per_piece: sellingPricePerPiece,
        cost_per_box: costPerBox,
        cost_per_piece: costPerPiece,
        total_selling_price: totalSellingPrice,
        total_cost: totalCost,
        profit: profit,
        remaining_balance: totalSellingPrice,
        payments: [],
        status: data.status || 'pending',
        delivery_date: data.deliveryDate || null,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      }

      const { data: inserted, error } = await supabase
        .from('bread_orders')
        .insert([newOrder])
        .select()

      if (error) throw error

      setOrders(prev => [inserted[0], ...prev])
      showNotification(`Order ${inserted[0].transaction_number} created!`, 'success')
      addLog('Created', 'Bread Order', `Created order: ${inserted[0].transaction_number}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding order:', error)
      showNotification('Failed to create order', 'error')
      return null
    }
  }

  const updateOrder = async (id, data) => {
    try {
      const { data: updated, error } = await supabase
        .from('bread_orders')
        .update({
          customer_name: data.customerName,
          product_name: data.productName,
          boxes: data.boxes || 0,
          pieces: data.pieces || 0,
          selling_price_per_box: data.sellingPricePerBox || 0,
          selling_price_per_piece: data.sellingPricePerPiece || 0,
          cost_per_box: data.costPerBox || 0,
          cost_per_piece: data.costPerPiece || 0,
          status: data.status || 'pending',
          delivery_date: data.deliveryDate || null,
          notes: data.notes || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setOrders(prev => prev.map(o => o.id === id ? updated[0] : o))
      showNotification('Order updated!', 'success')
      addLog('Updated', 'Bread Order', `Updated order: ${updated[0]?.transaction_number || 'Unknown'}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating order:', error)
      showNotification('Failed to update order', 'error')
      return null
    }
  }

  const deleteOrder = async (id) => {
    try {
      const order = orders.find(o => o.id === id)
      const { error } = await supabase
        .from('bread_orders')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setOrders(prev => prev.filter(o => o.id !== id))
      showNotification('Order moved to trash', 'warning')
      addLog('Deleted', 'Bread Order', `Soft deleted order: ${order?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting order:', error)
      showNotification('Failed to delete order', 'error')
    }
  }

  const restoreOrder = async (id) => {
    try {
      const order = orders.find(o => o.id === id)
      const { error } = await supabase
        .from('bread_orders')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadOrders()
      showNotification('Order restored!', 'success')
      addLog('Restored', 'Bread Order', `Restored order: ${order?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error restoring order:', error)
      showNotification('Failed to restore order', 'error')
    }
  }

  const permanentDeleteOrder = async (id) => {
    try {
      const order = orders.find(o => o.id === id)
      const { error } = await supabase
        .from('bread_orders')
        .delete()
        .eq('id', id)

      if (error) throw error

      setOrders(prev => prev.filter(o => o.id !== id))
      showNotification('Order permanently deleted', 'error')
      addLog('Deleted', 'Bread Order', `Permanently deleted order: ${order?.transaction_number || 'Unknown'}`)
    } catch (error) {
      console.error('Error permanently deleting order:', error)
      showNotification('Failed to permanently delete order', 'error')
    }
  }

  const addPayment = async (id, amount) => {
    try {
      const order = orders.find(o => o.id === id)
      if (!order) {
        showNotification('Order not found', 'error')
        return null
      }

      const payments = [...(order.payments || [])]
      let newBalance = order.remaining_balance - amount

      payments.push({
        id: Date.now(),
        amount: amount,
        date: new Date().toISOString(),
        type: 'payment'
      })

      const status = newBalance <= 0 ? 'completed' : order.status

      const { data: updated, error } = await supabase
        .from('bread_orders')
        .update({
          remaining_balance: newBalance < 0 ? 0 : newBalance,
          payments: payments,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setOrders(prev => prev.map(o => o.id === id ? updated[0] : o))
      addLog('Paid', 'Bread Order', `Payment of ₱${amount} recorded for ${order.transaction_number}`)
      showNotification(`Payment recorded!`, 'success')
      return updated[0]
    } catch (error) {
      console.error('Error adding payment:', error)
      showNotification('Failed to record payment', 'error')
      return null
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const order = orders.find(o => o.id === id)
      const { data: updated, error } = await supabase
        .from('bread_orders')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setOrders(prev => prev.map(o => o.id === id ? updated[0] : o))
      showNotification(`Order status updated to ${status}!`, 'success')
      addLog('Updated', 'Bread Order', `Order ${order?.transaction_number || 'Unknown'} status changed to ${status}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating order status:', error)
      showNotification('Failed to update order status', 'error')
      return null
    }
  }

  const getTotals = () => {
    const active = orders
    const totalOrders = active.length
    const totalSelling = active.reduce((sum, o) => sum + (o.total_selling_price || 0), 0)
    const totalCost = active.reduce((sum, o) => sum + (o.total_cost || 0), 0)
    const totalProfit = active.reduce((sum, o) => sum + (o.profit || 0), 0)
    const totalPaid = active.reduce((sum, o) => {
      const paid = (o.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, o) => sum + (o.remaining_balance || 0), 0)
    const pending = active.filter(o => o.status === 'pending').length
    const delivered = active.filter(o => o.status === 'delivered').length
    const completed = active.filter(o => o.status === 'completed').length

    return {
      totalOrders,
      totalSelling,
      totalCost,
      totalProfit,
      totalPaid,
      totalRemaining,
      pending,
      delivered,
      completed
    }
  }

  const getActiveOrders = () => orders.filter(o => !o.is_deleted)
  const getDeletedOrders = () => orders.filter(o => o.is_deleted)

  const value = {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    restoreOrder,
    permanentDeleteOrder,
    addPayment,
    updateOrderStatus,
    getTotals,
    getActiveOrders,
    getDeletedOrders,
    refreshOrders: loadOrders
  }

  return (
    <BreadOrderContext.Provider value={value}>
      {children}
    </BreadOrderContext.Provider>
  )
}
