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
        customer_id: data.customerId,
        customer_name: data.customerName,
        product_id: data.productId,
        product_name: data.productName,
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

  const value = {
    orders,
    loading,
    addOrder,
    addPayment,
    refreshOrders: loadOrders
  }

  return (
    <BreadOrderContext.Provider value={value}>
      {children}
    </BreadOrderContext.Provider>
  )
}
