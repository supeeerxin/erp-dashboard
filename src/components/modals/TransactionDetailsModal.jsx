import React from 'react'
import { X, Calendar, Clock, User, Package, DollarSign, CreditCard, FileText, CheckCircle, AlertCircle, Car as CarIcon } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'

const TransactionDetailsModal = ({ isOpen, onClose, transaction, type }) => {
  const { getCustomer } = useCustomers()

  if (!isOpen || !transaction) return null

  const customer = getCustomer(transaction.customer_id)
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>
      case 'overdue':
        return <span className="badge badge-danger"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>
      case 'active':
        return <span className="badge badge-warning">Active</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return '₱' + (amount || 0).toLocaleString()
  }

  const getTotalPaid = () => {
    const payments = transaction.payments || []
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const totalPaid = getTotalPaid()

  // Determine which render function to use based on type
  const renderDetails = () => {
    switch (type) {
      case 'rice-credit':
        return renderRiceCreditDetails()
      case 'cash-loan':
        return renderCashLoanDetails()
      case 'bread-order':
        return renderBreadOrderDetails()
      case 'rental':
        return renderRentalDetails()
      default:
        return renderRiceCreditDetails()
    }
  }

  const renderBreadOrderDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Order #</p>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {transaction.transaction_number || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <div>{getStatusBadge(transaction.status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {customer?.name || transaction.customer_name || 'Unknown'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.delivery_date)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Order Summary</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {transaction.product_name || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {transaction.boxes || 0} boxes · {transaction.pieces || 0} pieces
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Selling</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(transaction.total_selling_price)}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
             
