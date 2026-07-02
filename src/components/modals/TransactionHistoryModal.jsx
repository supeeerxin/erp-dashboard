import React from 'react'
import { X, Calendar, Clock, CheckCircle, Printer, Download, Hash } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'

const TransactionHistoryModal = ({ isOpen, onClose, transaction }) => {
  const { getCustomer } = useCustomers()

  if (!isOpen || !transaction) return null

  const customer = getCustomer(transaction.customerId)
  
  // Safe access to properties with fallbacks
  const totalPaid = transaction.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const isCompleted = transaction.status === 'completed'
  const transactionNumber = transaction.transactionNumber || `TRX-${String(transaction.id || '').slice(-6)}`
  const amount = transaction.amount || 0
  const remainingBalance = transaction.remainingBalance || 0
  const customerName = customer?.name || transaction.customerName || 'Unknown'
  const payments = transaction.payments || []

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'downpayment':
        return 'Down Payment'
      case 'payment':
        return 'Payment'
      default:
        return 'Payment'
    }
  }

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'downpayment':
        return 'text-blue-600 dark:text-blue-400'
      case 'payment':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    let csv = 'Transaction Number,Date,Time,Type,Amount,Balance\n'
    let runningBalance = amount
    
    csv += `Transaction #${transactionNumber}\n`
    csv += `Customer: ${customerName}\n`
    csv += `Total Amount: ₱${amount.toFixed(2)}\n\n`
    
    payments.forEach(p => {
      runningBalance -= (p.amount || 0)
      csv += `${transactionNumber},${formatDate(p.date)},${formatTime(p.date)},${getPaymentTypeLabel(p.type)},₱${(p.amount || 0).toFixed(2)},₱${runningBalance.toFixed(2)}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${transactionNumber}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Hash className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {transactionNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export CSV"
            >
              <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {customerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="font-bold text-gray-900 dark:text-white">
                ₱{amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                ₱{totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
                {isCompleted ? 'Completed' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Payment Records ({payments.length})
          </h4>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => {
                const runningBalance = amount - payments
                  .slice(0, index + 1)
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
                
                return (
                  <div 
                    key={payment.id || index}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-opacity-10 ${payment.type === 'downpayment' ? 'bg-blue-500' : 'bg-green-500'}`}>
                      {payment.type === 'downpayment' ? (
                        <Calendar className={`w-5 h-5 ${getPaymentTypeColor(payment.type)}`} />
                      ) : (
                        <CheckCircle className={`w-5 h-5 ${getPaymentTypeColor(payment.type)}`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getPaymentTypeLabel(payment.type)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payment.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(payment.date)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            ₱{(payment.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Balance: ₱{runningBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₱{totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</p>
                <p className={`text-lg font-bold ${remainingBalance === 0 ? 'text-green-600' : 'text-primary-500'}`}>
                  ₱{remainingBalance.toLocaleString()}
                </p>
              </div>
            </div>
            {isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Fully Paid!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionHistoryModal
