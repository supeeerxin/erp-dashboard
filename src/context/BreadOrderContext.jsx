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
    // Calculate totals
    const totalSellingPrice = (data.boxes || 0) * (data.sellingPricePerBox || 0) + (data.pieces || 0) * (data.sellingPricePerPiece || 0)
    const totalCost = (data.boxes || 0) * (data.costPerBox || 0) + (data.pieces || 0) * (data.costPerPiece || 0)
    const profit = totalSellingPrice - totalCost

    const newOrder = {
      id: Date.now(),
      transactionNumber: generateOrderNumber(),
      ...data,
      totalSellingPrice: totalSellingPrice,
      totalCost: totalCost,
      profit: profit,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }
    setOrders(prev => [...prev, newOrder])
    showNotification(`Order ${newOrder.transactionNumber} created!`, 'success')
    return newOrder
  }

  const updateOrder = (id, data) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updated = { ...order, ...data, updatedAt: new Date().toISOString() }
        // Recalculate totals
        const boxes = data.boxes !== undefined ? data.boxes : order.boxes
        const pieces = data.pieces !== undefined ? data.pieces : order.pieces
        const sellingPricePerBox = data.sellingPricePerBox !== undefined ? data.sellingPricePerBox : order.sellingPricePerBox
        const sellingPricePerPiece = data.sellingPricePerPiece !== undefined ? data.sellingPricePerPiece : order.sellingPricePerPiece
        const costPerBox = data.costPerBox !== undefined ? data.costPerBox : order.costPerBox
        const costPerPiece = data.costPerPiece !== undefined ? data.costPerPiece : order.costPerPiece
        
        updated.totalSellingPrice = (boxes || 0) * (sellingPricePerBox || 0) + (pieces || 0) * (sellingPricePerPiece || 0)
        updated.totalCost = (boxes || 0) * (costPerBox || 0) + (pieces || 0) * (costPerPiece || 0)
        updated.profit = updated.totalSellingPrice - updated.totalCost
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
    setOrders(prev => prev.map(order =>
      order.id === id
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ))
    showNotification(`Order status updated to ${status}!`, 'success')
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
    const pending = active.filter(o => o.status === 'pending').length
    const baking = active.filter(o => o.status === 'baking').length
    const delivered = active.filter(o => o.status === 'delivered').length
    const completed = active.filter(o => o.status === 'completed').length

    return {
      totalOrders,
      totalSelling,
      totalCost,
      totalProfit,
      pending,
      baking,
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
