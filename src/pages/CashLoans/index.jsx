import React, { useState } from 'react'
import { DollarSign, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive } from 'lucide-react'
import { useCashLoans } from '../../context/CashLoanContext'
import { useCustomers } from '../../context/CustomerContext'
import CashLoanModal from '../../components/modals/CashLoanModal'
import PaymentModal from '../../components/modals/PaymentModal'
import TransactionDetailsModal from '../../components/modals/TransactionDetailsModal'

const CashLoans = () => {
  const { 
    loans, 
    deletedLoans,
    addLoan, 
    updateLoan, 
    deleteLoan,
    restoreLoan,
    permanentDeleteLoan,
    addPayment,
    getTotals 
  } = useCashLoans()
  const { getCustomer } = useCustomers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [selectedLoan, setSelectedLoan] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedLoans : loans

  const filteredLoans = currentList.filter(l => {
    const customer = getCustomer(l.customer_id)
    const search = searchQuery.toLowerCase()
    return customer?.name?.toLowerCase().includes(search) ||
           l.customer_name?.toLowerCase().includes(search) ||
           l.description?.toLowerCase().includes(search) ||
           l.transaction_number?.toLowerCase().includes(search)
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

  const handleAddLoan = async (data) => {
    const result = await addLoan(data)
    if (result) {
      setIsModalOpen(false)
      setEditingLoan(null)
    }
  }

  const handleEditLoan = (loan) => {
    setEditingLoan(loan)
    setIsModalOpen(true)
  }

  const handleUpdateLoan = async (data) => {
    const result = await updateLoan(editingLoan.id, data)
    if (result) {
      setEditingLoan(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteLoan = (id) => {
    if (window.confirm('Move this loan to trash?')) {
      deleteLoan(id)
    }
  }

  const handleRestoreLoan = (id) => {
    restoreLoan(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this loan?')) {
      permanentDeleteLoan(id)
    }
  }

  const handlePayment = (loan) => {
    setSelectedLoan(loan)
    setIsPaymentModalOpen(true)
  }

  const handleRecordPayment = (amount) => {
    addPayment(selectedLoan.id, amount)
    setSelectedLoan(null)
    setIsPaymentModalOpen(false)
  }

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan)
    setIsDetailsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLoan(null)
  }

  const getTotalPayments = (loan) => {
    const payments = loan.payments || []
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Loans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage cash loans with interest tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedLoans.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Loan
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Principal</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₱{(totals.totalPrincipal || 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            ₱{(totals.totalInterest || 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Payable</p>
          <p className="text-lg font-bold text-primary-500">
            ₱{(totals.totalPayable || 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Balance</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₱{(totals.totalRemaining || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showTrash ? "Search trash..." : "Search loans by customer or transaction #..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Loan List */}
      {filteredLoans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <DollarSign className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No loans found' : showTrash ? 'Trash is empty' : 'No loans yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted loans will appear here' : 'Start by creating your first loan'
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
                  <th className="table-header text-right">Principal</th>
                  <th className="table-header text-right">Interest</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Paid</th>
                  <th className="table-header text-right">Balance</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => {
                  const customer = getCustomer(loan.customer_id)
                  const totalPaid = getTotalPayments(loan)
                  const isPaid = loan.status === 'completed' || loan.remaining_balance === 0
                  
                  return (
                    <tr key={loan.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">
                        {loan.transaction_number || `LOAN-${loan.id.toString().slice(-6)}`}
                      </td>
                      <td className="table-cell font-medium">
                        {customer?.name || loan.customer_name || 'Unknown'}
                      </td>
                      <td className="table-cell text-right">
                        ₱{(loan.principal || 0).toLocaleString()}
                      </td>
                      <td className="table-cell text-right text-yellow-600 dark:text-yellow-400">
                        ₱{(loan.interest_amount || 0).toLocaleString()}
                      </td>
                      <td className="table-cell text-right font-medium text-primary-500">
                        ₱{(loan.total_payable || 0).toLocaleString()}
                      </td>
                      <td className="table-cell text-right text-green-600 dark:text-green-400">
                        ₱{(totalPaid || 0).toLocaleString()}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-900 dark:text-white">
                        ₱{(loan.remaining_balance || 0).toLocaleString()}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(loan.status)}
                        {loan.is_deleted && (
                          <span className="badge badge-danger ml-1">Deleted</span>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(loan)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          {!loan.is_deleted && !isPaid && (
                            <button
                              onClick={() => handlePayment(loan)}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          {loan.is_deleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreLoan(loan.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(loan.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditLoan(loan)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteLoan(loan.id)}
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
      <CashLoanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingLoan ? handleUpdateLoan : handleAddLoan}
        loan={editingLoan}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedLoan(null)
        }}
        onSave={handleRecordPayment}
        customerName={selectedLoan ? 
          getCustomer(selectedLoan.customer_id)?.name || selectedLoan.customer_name : ''
        }
        remainingBalance={selectedLoan?.remaining_balance || 0}
        suggestedAmount={selectedLoan?.payment_per_give || 0}
      />

      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedLoan(null)
        }}
        transaction={selectedLoan}
        type="cash-loan"
      />
    </div>
  )
}

export default CashLoans
