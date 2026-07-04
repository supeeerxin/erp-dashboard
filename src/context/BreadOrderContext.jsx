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
      console.log('📝 Adding bread order with data:', data)

      if (!data.customerId || !data.productId) {
        showNotification('Please select a customer and product', 'error')
        return null
      }

      const boxes = parseInt(data.boxes) || 0
      const pieces = parseInt(data.pieces) || 0
      const sellingPricePerBox = parseFloat(data.sellingPricePerBox) || 0
      const sellingPricePerPiece = parseFloat(data.sellingPricePerPiece) || 0
      const costPerBox = parseFloat(data.costPerBox) || 0
      const costPerPiece = parseFloat(data.costPerPiece) || 0
      
      const totalSellingPrice = (boxes * sellingPricePerBox) + (pieces * sellingPricePerPiece)
      const totalCost = (boxes * costPerBox) + (pieces * costPerPiece)
      const profit = totalSellingPrice - totalCost

      const newOrder = {
        id: Date.now(),
        transaction_number: generateOrderNumber(),
        customer_id: parseInt(data.customerId),
        customer_name: data.customerName || '',
        product_id: parseInt(data.productId),
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

      console.log('📤 Inserting bread order:', newOrder)

      const { data: inserted, error } = await supabase
        .from('bread_orders')
        .insert([newOrder])
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        showNotification('Failed to create order: ' + error.message, 'error')
        return null
      }

      console.log('✅ Bread order created:', inserted[0])
      setOrders(prev => [inserted[0], ...prev])
      showNotification(`Order ${inserted[0].transaction_number} created!`, 'success')
      addLog('Created', 'Bread Order', `Created order: ${inserted[0].transaction_number}`)
      return inserted[0]
    } catch (error) {
      console.error('❌ Error adding order:', error)
      showNotification('Failed to create order: ' + error.message, 'error')
      return null
    }
  }

  const updateOrder = async (id, data) => {
    try {
      const order = orders.find(o => o.id === id)
      if (!order) {
        showNotification('Order not found', 'error')
        return null
      }

      const boxes = parseInt(data.boxes) || order.boxes || 0
      const pieces = parseInt(data.pieces) || order.pieces || 0
      const sellingPricePerBox = parseFloat(data.sellingPricePerBox) || order.selling_price_per_box || 0
      const sellingPricePerPiece = parseFloat(data.sellingPricePerPiece) || order.selling_price_per_piece || 0
      const costPerBox = parseFloat(data.costPerBox) || order.cost_per_box || 0
      const costPerPiece = parseFloat(data.costPerPiece) || order.cost_per_piece || 0
      
      const totalSellingPrice = (boxes * sellingPricePerBox) + (pieces * sellingPricePerPiece)
      const totalCost = (boxes * costPerBox) + (pieces * costPerPiece)
      const profit = totalSellingPrice - totalCost

      const { data: updated, error } = await supabase
        .from('bread_orders')
        .update({
          customer_name: data.customerName || order.customer_name,
          product_name: data.productName || order.product_name,
          boxes: boxes,
          pieces: pieces,
          selling_price_per_box: sellingPricePerBox,
          selling_price_per_piece: sellingPricePerPiece,
          cost_per_box: costPerBox,
          cost_per_piece: costPerPiece,
          total_selling_price: totalSellingPrice,
          total_cost: totalCost,
          profit: profit,
          status: data.status || order.status,
          delivery_date: data.deliveryDate || order.delivery_date,
          notes: data.notes || order.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating order:', error)
        showNotification('Failed to update order', 'error')
        return null
      }

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

      if (amount > order.remaining_balance) {
        showNotification(`Amount exceeds remaining balance of ₱${order.remaining_balance}`, 'error')
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

      if (error) {
        console.error('Error adding payment:', error)
        showNotification('Failed to record payment', 'error')
        return null
      }

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
      if (!order) {
        showNotification('Order not found', 'error')
        return null
      }

      const { data: updated, error } = await supabase
        .from('bread_orders')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating order status:', error)
        showNotification('Failed to update order status', 'error')
        return null
      }

      setOrders(prev => prev.map(o => o.id === id ? updated[0] : o))
      showNotification(`Order status updated to ${status}!`, 'success')
      addLog('Updated', 'Bread Order', `Order ${order.transaction_number} status changed to ${status}`)
      return updated[0]
    } catch (error) {
      console.error('Error updating order status:', error)
      showNotification('Failed to update order status', 'error')
      return null
    }
  }

  const getTotals = () => {
    // Safe check - if orders is undefined or not an array, return default values
    if (!orders || !Array.isArray(orders)) {
      return {
        totalOrders: 0,
        totalSelling: 0,
        totalCost: 0,
        totalProfit: 0,
        totalPaid: 0,
        totalRemaining: 0,
        pending: 0,
        delivered: 0,
        completed: 0
      }
    }

    const totalOrders = orders.length || 0
    const totalSelling = orders.reduce((sum, o) => sum + (o.total_selling_price || 0), 0)
    const totalCost = orders.reduce((sum, o) => sum + (o.total_cost || 0), 0)
    const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0)
    const totalPaid = orders.reduce((sum, o) => {
      const paid = (o.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
      return sum + paid
    }, 0)
    const totalRemaining = orders.reduce((sum, o) => sum + (o.remaining_balance || 0), 0)
    const pending = orders.filter(o => o.status === 'pending').length || 0
    const delivered = orders.filter(o => o.status === 'delivered').length || 0
    const completed = orders.filter(o => o.status === 'completed').length || 0

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

  const getActiveOrders = () => {
    return orders && Array.isArray(orders) ? orders.filter(o => !o.is_deleted) : []
  }

  const getDeletedOrders = () => {
    return orders && Array.isArray(orders) ? orders.filter(o => o.is_deleted) : []
  }

  const value = {
    orders: getActiveOrders(),
    deletedOrders: getDeletedOrders(),
    allOrders: orders,
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
