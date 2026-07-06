import React from 'react'
import { X, Calendar, Clock, User, Package, DollarSign, CreditCard, FileText, CheckCircle, AlertCircle, Car as CarIcon, TrendingUp, TrendingDown } from 'lucide-react'
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
      case 'paid':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>
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

  // ==================== RICE CREDIT DETAILS ====================
  const renderRiceCreditDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction #</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(transaction.created_at)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Financial Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(transaction.remaining_balance)}
              </p>
            </div>
          </div>
        </div>

        {transaction.cost > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cost & Profit</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Puhunan / Cost</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(transaction.cost)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                <p className={`text-lg font-bold ${(transaction.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.profit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {transaction.payments && transaction.payments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payment History ({transaction.payments.length})
            </h4>
            <div className="space-y-2">
              {transaction.payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.type === 'downpayment' ? 'Down Payment' : 'Payment'} #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(payment.date)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {transaction.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== CASH LOAN DETAILS ====================
  const renderCashLoanDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Loan #</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.due_date)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Loan Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Principal</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(transaction.principal)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Interest</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(transaction.interest_amount)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Payable</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(transaction.total_payable)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(transaction.remaining_balance)}
            </p>
          </div>
        </div>

        {transaction.payments && transaction.payments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payment History ({transaction.payments.length})
            </h4>
            <div className="space-y-2">
              {transaction.payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.type === 'downpayment' ? 'Down Payment' : 'Payment'} #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(payment.date)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {transaction.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== BREAD ORDER DETAILS ====================
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
              {formatCurrency(transaction.total_cost)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(transaction.remaining_balance)}
            </p>
          </div>
        </div>

        {transaction.payments && transaction.payments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payment History ({transaction.payments.length})
            </h4>
            <div className="space-y-2">
              {transaction.payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Payment #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(payment.date)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {transaction.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.notes}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== RENTAL DETAILS ====================
  const renderRentalDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rental #</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.driver_name || 'Unknown'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.vehicle_plate || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.start_date)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.end_date)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rental Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Days</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {transaction.total_days || 0} days
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Rate</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(transaction.daily_boundary)}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(transaction.total_amount)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(transaction.remaining_balance)}
            </p>
          </div>
        </div>

        {transaction.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.notes}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== PAYABLE DETAILS ====================
  const renderPayableDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.name || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <div>{getStatusBadge(transaction.status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.category || 'Other'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.due_date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.frequency || 'Monthly'}
            </p>
          </div>
        </div>

        {transaction.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== INCOME DETAILS ====================
  const renderIncomeDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction #</p>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {transaction.transaction_number || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <div>{getStatusBadge(transaction.is_deleted ? 'deleted' : 'active')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.source || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.category || 'Other'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.date)}
            </p>
          </div>
        </div>

        {transaction.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== EXPENSE DETAILS ====================
  const renderExpenseDetails = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Transaction #</p>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {transaction.transaction_number || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <div>{getStatusBadge(transaction.is_deleted ? 'deleted' : 'active')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Item</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.item || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {transaction.category || 'Other'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.date)}
            </p>
          </div>
        </div>

        {transaction.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ==================== RENDER BASED ON TYPE ====================
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
      case 'payable':
        return renderPayableDetails()
      case 'income':
        return renderIncomeDetails()
      case 'expense':
        return renderExpenseDetails()
      default:
        return renderRiceCreditDetails()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Transaction Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
              {type?.replace('-', ' ') || 'Transaction'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {renderDetails()}
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailsModal
