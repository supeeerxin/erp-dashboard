import React, { useState } from 'react'
import { ShoppingBag, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive, Package, CheckCircle, Clock, Truck, List, AlertCircle, DollarSign } from 'lucide-react'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useBreadProducts } from '../../context/BreadProductContext'
import { useCustomers } from '../../context/CustomerContext'
import BreadOrderModal from '../../components/modals/BreadOrderModal'
import BreadProductModal from '../../components/modals/BreadProductModal'
import TransactionHistoryModal from '../../components/modals/TransactionHistoryModal'
import PaymentModal from '../../components/modals/PaymentModal'

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
    addPayment,
    getTotals 
  } = useBreadOrders()
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useBreadProducts()
  const { getCustomer } = useCustomers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Paid</span>
      case 'delivered':
        return <span className="badge badge-info">Delivered</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'delivered':
        return <Truck className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleAddOrder = (data) => {
    const result = addOrder(data)
    if (result === null) {
      return
    }
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

  const handleViewHistory = (order) => {
    setSelectedOrder(order)
    setIsHistoryModalOpen(true)
  }

  const handlePayment = (order) => {
    setSelectedOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handleRecordPayment = (amount) => {
    addPayment(selectedOrder.id, amount)
    setSelectedOrder(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
  }

  const handleAddProduct = (data) => {
    addProduct(data)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleUpdateProduct = (data) => {
    updateProduct(editingProduct.id, data)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id) => {
    if (window.confirm('Delete this product?')) {
      deleteProduct(id)
    }
  }

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  const getTotalPayments = (order) => {
    return (order.payments || []).reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bread Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage bread orders with inventory and profit tracking
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowProducts(!showProducts)}
            className={`btn-secondary flex items-center gap-2 ${showProducts ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            <List className="w-4 h-4" />
            {showProducts ? 'Orders' : 'Products'}
          </button>
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedOrders.length})`}
          </button>
          {!showTrash && !showProducts && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          )}
          {showProducts && (
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!showProducts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.totalOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
            <p className="text-lg font-bold text-primary-500">₱{totals.totalSelling?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
            <p className="text-lg font-bold text-green-600">₱{totals.totalPaid?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-red-500">₱{totals.totalRemaining?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showProducts ? "Search products..." : showTrash ? "Search trash..." : "Search orders..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Products View */}
      {showProducts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full card">
              <div className="empty-state">
                <Package className="empty-state-icon" />
                <p className="empty-state-text">No products found</p>
                <p className="empty-state-subtext">Add your first bread product</p>
              </div>
            </div>
          ) : (
            filteredProducts.map(product => {
              const isLowStock = (product.stockBoxes || 0) <= 5 && (product.stockBoxes || 0) > 0
              const isOutOfStock = (product.stockBoxes || 0) === 0
              
              return (
                <div key={product.id} className="card card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          Selling: <span className="font-medium text-primary-500">₱{product.sellingPricePerBox?.toLocaleString() || 0}/box</span>
                          <span className="text-gray-400 ml-1">({product.piecesPerBox || 24} pcs)</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cost: <span className="font-medium text-gray-900 dark:text-white">₱{product.costPerBox?.toLocaleString() || 0}/box</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'}`}>
                            Stock: {product.stockBoxes || 0} boxes
                          </p>
                          {isLowStock && !isOutOfStock && (
                            <span className="text-xs text-yellow-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Low stock!
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Out of stock!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* Orders List */
        filteredOrders.length === 0 ? (
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
                    <th className="table-header text-right">Total</th>
                    <th className="table-header text-right">Paid</th>
                    <th className="table-header text-right">Balance</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const customer = getCustomer(order.customerId)
                    const product = products.find(p => p.id === order.productId)
                    const totalPaid = getTotalPayments(order)
                    const isPaid = order.status === 'completed' || order.remainingBalance === 0
                    
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
                        <td className="table-cell text-right font-medium text-primary-500">
                          ₱{order.totalSellingPrice?.toLocaleString() || 0}
                        </td>
                        <td className="table-cell text-right text-green-600">
                          ₱{totalPaid.toLocaleString()}
                        </td>
                        <td className="table-cell text-right font-medium text-red-500">
                          ₱{order.remainingBalance?.toLocaleString() || 0}
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
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <button
                              onClick={() => handleViewHistory(order)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                              title="View History"
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                            </button>
                            
                            {!order.isDeleted && !isPaid && (
                              <button
                                onClick={() => handlePayment(order)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Record Payment"
                              >
                                <DollarSign className="w-4 h-4 text-green-500" />
                              </button>
                            )}

                            {!order.isDeleted && (
                              <button
                                onClick={() => handleEditOrder(order)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
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
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Move to trash"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
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
        )
      )}

      {/* Modals */}
      <BreadOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingOrder ? handleUpdateOrder : handleAddOrder}
        order={editingOrder}
      />

      <BreadProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        product={editingProduct}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedOrder(null)
        }}
        transaction={selectedOrder}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedOrder(null)
        }}
        onSave={handleRecordPayment}
        customerName={selectedOrder ? 
          getCustomer(selectedOrder.customerId)?.name || selectedOrder.customerName : ''
        }
        remainingBalance={selectedOrder?.remainingBalance || 0}
        suggestedAmount={selectedOrder?.remainingBalance || 0}
      />
    </div>
  )
}

export default BreadOrders
