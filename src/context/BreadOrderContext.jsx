import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
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

  useEffect(() => {
    const saved = localStorage.getItem('breadOrders')
    if (saved) {
      setOrders(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('breadOrders', JSON.stringify(orders))
    }
  }, [orders, loading])

  const addOrder = (data) => {
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
        transactionNumber: generateOrderNumber(),
        ...data,
        totalSellingPrice: totalSellingPrice,
        totalCost: totalCost,
        profit: profit,
        remainingBalance: totalSellingPrice, // Track remaining balance
        payments: [], // Track payments
        status: data.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      }
      
      setOrders(prev => [...prev, newOrder])
      showNotification(`Order ${newOrder.transactionNumber} created!`, 'success')
      return newOrder
    } catch (error) {
      console.error('Error creating order:', error)
      showNotification('Failed to create order. Please try again.', 'error')
      return null
    }
  }

  // Add payment to order
  const addPayment = (id, amount) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const newBalance = order.remainingBalance - amount
        
        if (newBalance <= 0) {
          // Fully paid
          const payments = [...(order.payments || []), {
            id: Date.now(),
            amount: order.remainingBalance,
            date: new Date().toISOString(),
            type: 'payment'
          }]
          return {
            ...order,
            payments,
            remainingBalance: 0,
            status: 'completed',
            updatedAt: new Date().toISOString()
          }
        }
        
        // Partial payment
        const payments = [...(order.payments || []), {
          id: Date.now(),
          amount,
          date: new Date().toISOString(),
          type: 'payment'
        }]
        
        return {
          ...order,
          payments,
          remainingBalance: newBalance,
          updatedAt: new Date().toISOString()
        }
      }
      return order
    }))
    showNotification(`Payment recorded!`, 'success')
  }

  const updateOrder = (id, data) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updated = { ...order, ...data, updatedAt: new Date().toISOString() }
        
        if (data.boxes !== undefined || data.pieces !== undefined) {
          const boxes = data.boxes !== undefined ? data.boxes : order.boxes
          const pieces = data.pieces !== undefined ? data.pieces : order.pieces
          const sellingPricePerBox = order.sellingPricePerBox || 0
          const sellingPricePerPiece = order.sellingPricePerPiece || 0
          const costPerBox = order.costPerBox || 0
          const costPerPiece = order.costPerPiece || 0
          
          updated.totalSellingPrice = (boxes || 0) * sellingPricePerBox + (pieces || 0) * sellingPricePerPiece
          updated.totalCost = (boxes || 0) * costPerBox + (pieces || 0) * costPerPiece
          updated.profit = updated.totalSellingPrice - updated.totalCost
          updated.remainingBalance = updated.totalSellingPrice - (order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
        }
        return updated
      }
      return order
    }))
    showNotification('Order updated!', 'success')
  }

  const deleteOrder = (id) => {
    setOrders(prev => prev.map(order =>
      order.id === id
        ? { ...order, isDeleted: true, deletedAt: new Date().toISOString() }
        : order
    ))
    showNotification('Order moved to trash', 'warning')
  }

  const restoreOrder = (id) => {
    setOrders(prev => prev.map(order =>
      order.id === id
        ? { ...order, isDeleted: false, deletedAt: null }
        : order
    ))
    showNotification('Order restored!', 'success')
  }

  const permanentDeleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id))
    showNotification('Order permanently deleted', 'error')
  }

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        if (status === 'completed' && order.status !== 'completed') {
          // If marked as completed, auto-pay remaining balance
          if (order.remainingBalance > 0) {
            const payments = [...(order.payments || []), {
              id: Date.now(),
              amount: order.remainingBalance,
              date: new Date().toISOString(),
              type: 'payment'
            }]
            return {
              ...order,
              status,
              payments,
              remainingBalance: 0,
              updatedAt: new Date().toISOString()
            }
          }
          showNotification(`Order ${order.transactionNumber} completed!`, 'success')
        }
        if (status === 'delivered' && order.status !== 'delivered') {
          showNotification(`Order ${order.transactionNumber} delivered!`, 'success')
        }
        return { ...order, status, updatedAt: new Date().toISOString() }
      }
      return order
    }))
  }

  const getActiveOrders = () => {
    return orders.filter(o => !o.isDeleted)
  }

  const getDeletedOrders = () => {
    return orders.filter(o => o.isDeleted)
  }

  const getTotals = () => {
    const active = getActiveOrders()
    const totalOrders = active.length
    const totalSelling = active.reduce((sum, o) => sum + (o.totalSellingPrice || 0), 0)
    const totalCost = active.reduce((sum, o) => sum + (o.totalCost || 0), 0)
    const totalProfit = active.reduce((sum, o) => sum + (o.profit || 0), 0)
    const totalPaid = active.reduce((sum, o) => {
      const paid = (o.payments || []).reduce((s, p) => s + p.amount, 0)
      return sum + paid
    }, 0)
    const totalRemaining = active.reduce((sum, o) => sum + (o.remainingBalance || 0), 0)
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
    updateOrderStatus,
    addPayment,
    getTotals,
    getActiveOrders,
    getDeletedOrders
  }

  return (
    <BreadOrderContext.Provider value={value}>
      {children}
    </BreadOrderContext.Provider>
  )
}
