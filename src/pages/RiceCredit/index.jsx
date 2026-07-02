import React, { useState } from 'react'
import { Package, Plus, Search, Edit2, Trash2, RotateCcw, DollarSign, Archive, Eye } from 'lucide-react'
import { useRiceCredit } from '../../context/RiceCreditContext'
import { useCustomers } from '../../context/CustomerContext'
import RiceCreditModal from '../../components/modals/RiceCreditModal'
import PaymentModal from '../../components/modals/PaymentModal'
import TransactionHistoryModal from '../../components/modals/TransactionHistoryModal'

const RiceCredit = () => {
  const { 
    transactions, 
    deletedTransactions,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    restoreTransaction,
    permanentDeleteTransaction,
    addPayment,
    getTotals 
  } = useRiceCredit()
  const { getCustomer } = useCustomers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedTransactions : transactions

  const filteredTransactions = currentList.filter(t => {
    const customer = getCustomer(t.customerId)
    const search = searchQuery.toLowerCase()
    return customer?.name?.toLowerCase().includes(search) ||
           t.customerName?.toLowerCase().includes(search) ||
           t.description?.toLowerCase().includes(search)
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>
      default:
        return <span className="badge badge-warning">Active</span>
    }
  }

  const handleAddTransaction = (data) => {
    addTransaction(data)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleUpdateTransaction = (data) => {
    updateTransaction(editingTransaction.id, data)
    setEditingTransaction(null)
  }

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Move this transaction to trash?')) {
      deleteTransaction(id)
    }
  }

  const handleRestoreTransaction = (id) => {
    restoreTransaction(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this transaction?')) {
      permanentDeleteTransaction(id)
    }
  }

  const handlePayment = (transaction) => {
    setSelectedTransaction(transaction)
    setIsPaymentModalOpen(true)
  }

  const handleRecordPayment = (amount) => {
    addPayment(selectedTransaction.id, amount)
    setSelectedTransaction(null)
  }

  const handleViewHistory = (transaction) => {
    setSelectedTransaction(transaction)
    setIsHistoryModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const getTotalPayments = (transaction) => {
    const payments = transaction.payments || []
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rice Credit</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage rice credit transactions with installment payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedTransactions.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₱{totals.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₱{totals.totalCost.toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
          <p className={`text-lg font-bold ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{totals.totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Balance</p>
          <p className="text-lg font-bold text-primary-500">
            ₱{totals.totalRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showTrash ? "Search trash..." : "Search transactions..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No transactions found' : showTrash ? 'Trash is empty' : 'No transactions yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted transactions will appear here' : 'Start by creating your first transaction'
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
                  <th className="table-header">Transaction #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Down</th>
                  <th className="table-header text-right">Paid</th>
                  <th className="table-header text-right">Balance</th>
                  <th className="table-header text-right">Gives</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const customer = getCustomer(transaction.customerId)
                  const totalPaid = getTotalPayments(transaction)
                  const downPayment = transaction.downPayment || 0
                  const numberOfPayments = transaction.numberOfPayments || 1
                  const isPaid = transaction.status === 'completed' || transaction.remainingBalance === 0
                  
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     
                      <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">
  {transaction.transactionNumber || `TRX-${transaction.id.toString().slice(-6)}`}
</td>
                      <td className="table-cell font-medium">
                        {customer?.name || transaction.customerName || 'Unknown'}
                      </td>
                      <td className="table-cell text-right">
                        ₱{transaction.amount.toLocaleString()}
                      </td>
                      <td className="table-cell text-right text-blue-600 dark:text-blue-400">
                        ₱{downPayment.toLocaleString()}
                      </td>
                      <td className="table-cell text-right text-green-600 dark:text-green-400">
                        ₱{totalPaid.toLocaleString()}
                      </td>
                      <td className="table-cell text-right font-medium text-primary-500">
                        ₱{transaction.remainingBalance.toLocaleString()}
                      </td>
                      <td className="table-cell text-right text-sm">
                        {numberOfPayments > 1 ? (
                          <span className="text-gray-600 dark:text-gray-400">
                            {numberOfPayments} gives
                            <br />
                            <span className="text-xs">₱{transaction.paymentPerGive?.toFixed(2)}/give</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">1 give</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(transaction.status)}
                        {transaction.isDeleted && (
                          <span className="badge badge-danger ml-1">Deleted</span>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHistory(transaction)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View History"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          {!transaction.isDeleted && !isPaid && (
                            <button
                              onClick={() => handlePayment(transaction)}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          {transaction.isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreTransaction(transaction.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(transaction.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditTransaction(transaction)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
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
      <RiceCreditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        transaction={editingTransaction}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedTransaction(null)
        }}
        onSave={handleRecordPayment}
        customerName={selectedTransaction ? 
          getCustomer(selectedTransaction.customerId)?.name || selectedTransaction.customerName : ''
        }
        remainingBalance={selectedTransaction?.remainingBalance || 0}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}

export default RiceCredit
