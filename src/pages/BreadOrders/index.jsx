import React, { useState } from 'react'
import { ShoppingBag, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive, Package, CheckCircle, Clock, Truck } from 'lucide-react'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useCustomers } from '../../context/CustomerContext'
import { useBreadProducts } from '../../context/BreadProductContext'
import BreadOrderModal from '../../components/modals/BreadOrderModal'
import TransactionHistoryModal from '../../components/modals/TransactionHistoryModal'

const BreadOrders = () => {
  const { 
    orders, 
    deletedOrders,
    addOrder, 
    updateOrder, 
    deleteOrder,
    restoreOrder,
    permanentDeleteOrder,
    updateOrderStatus,
    getTotals 
  } = useBreadOrders()
  const { getCustomer } = useCustomers()
  const { getProduct } = useBreadProducts()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedOrders : orders

  const filteredOrders = currentList.filter(o => {
    const customer = getCustomer(o.customerId)
    const search = searchQuery.toLowerCase()
    return customer?.name?.toLowerCase().includes(search) ||
           o.customerName?.toLowerCase().includes(search) ||
           o.productName?.toLowerCase().includes(search) ||
           o.transactionNumber?.toLowerCase().includes(search) ||
           o.notes?.toLowerCase().includes(search)
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'delivered':
        return <span className="badge badge-info">Delivered</span>
      case 'baking':
        return <span className="badge badge-warning">Baking</span>
      default:
        return <span className="badge badge-secondary">Pending</span>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'delivered':
        return <Truck className="w-4 h-4" />
      case 'baking':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleAddOrder = (data) => {
    addOrder(data)
  }

  const handleEditOrder = (order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleUpdateOrder = (data) => {
    updateOrder(editingOrder.id, data)
    setEditingOrder(null)
  }

  const handleDeleteOrder = (id) => {
    if (window.confirm('Move this order to trash?')) {
      deleteOrder(id)
    }
  }

  const handleRestoreOrder = (id) => {
    restoreOrder(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this order?')) {
      permanentDeleteOrder(id)
    }
  }

  const handleStatusChange = (id, status) => {
    updateOrderStatus(id, status)
  }

  const handleViewHistory = (order) => {
    setSelectedOrder(order)
    setIsHistoryModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bread Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage bread orders with box and piece pricing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedOrders.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.totalOrders}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
          <p className="text-lg font-bold text-primary-500">₱{totals.totalAmount.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-lg font-bold text-yellow-500">{totals.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Baking</p>
          <p className="text-lg font-bold text-blue-500">{totals.baking}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
          <p className="text-lg font-bold text-green-500">{totals.delivered}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showTrash ? "Search trash..." : "Search orders by customer, product, or transaction #..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingBag className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No orders found' : showTrash ? 'Trash is empty' : 'No orders yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted orders will appear here' : 'Start by creating your first order'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="table-header">Order #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Product</th>
                  <th className="table-header text-right">Boxes</th>
                  <th className="table-header text-right">Pieces</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customer = getCustomer(order.customerId)
                  const product = getProduct(order.productId)
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">
                        {order.transactionNumber || `ORD-${order.id.toString().slice(-6)}`}
                      </td>
                      <td className="table-cell font-medium">
                        {customer?.name || order.customerName || 'Unknown'}
                      </td>
                      <td className="table-cell">
                        {product?.name || order.productName || 'Unknown'}
                      </td>
                      <td className="table-cell text-right">
                        {order.boxes || 0}
                      </td>
                      <td className="table-cell text-right">
                        {order.pieces || 0}
                      </td>
                      <td className="table-cell text-right font-medium text-primary-500">
                        ₱{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {order.isDeleted && (
                            <span className="badge badge-danger">Deleted</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHistory(order)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View History"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          
                          {!order.isDeleted && (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              <option value="pending">Pending</option>
                              <option value="baking">Baking</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}

                          {order.isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreOrder(order.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(order.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditOrder(order)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <BreadOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingOrder ? handleUpdateOrder : handleAddOrder}
        order={editingOrder}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedOrder(null)
        }}
        transaction={selectedOrder}
      />
    </div>
  )
}

export default BreadOrders
