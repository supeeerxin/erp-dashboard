import React, { useState } from 'react'
import { CreditCard, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { usePayables } from '../../context/PayableContext'
import PayableModal from '../../components/modals/PayableModal'
import TransactionDetailsModal from '../../components/modals/TransactionDetailsModal'

const Payables = () => {
  const { 
    payables, 
    deletedPayables,
    addPayable, 
    updatePayable, 
    deletePayable,
    restorePayable,
    permanentDeletePayable,
    markAsPaid,
    getTotals 
  } = usePayables()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingPayable, setEditingPayable] = useState(null)
  const [selectedPayable, setSelectedPayable] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedPayables : payables

  const filteredPayables = currentList.filter(p => {
    const search = searchQuery.toLowerCase()
    return p.name?.toLowerCase().includes(search) ||
           p.category?.toLowerCase().includes(search) ||
           p.description?.toLowerCase().includes(search)
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>
      case 'overdue':
        return <span className="badge badge-danger"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>
      default:
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" /> Unpaid</span>
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Bills': 'badge-warning',
      'Loan': 'badge-danger',
      'Insurance': 'badge-info',
      'Rent': 'badge-primary',
      'St. Peter': 'badge-secondary',
      'Bank': 'badge-success',
      'Credit Card': 'badge-danger',
      'Utilities': 'badge-warning',
      'Internet': 'badge-info',
      'Phone': 'badge-info',
      'Other': 'badge-secondary'
    }
    return colors[category] || 'badge-secondary'
  }

  const handleAddPayable = async (data) => {
    const result = await addPayable(data)
    if (result) {
      setIsModalOpen(false)
      setEditingPayable(null)
    }
  }

  const handleEditPayable = (payable) => {
    setEditingPayable(payable)
    setIsModalOpen(true)
  }

  const handleUpdatePayable = async (data) => {
    const result = await updatePayable(editingPayable.id, data)
    if (result) {
      setEditingPayable(null)
      setIsModalOpen(false)
    }
  }

  const handleDeletePayable = (id) => {
    if (window.confirm('Move this payable to trash?')) {
      deletePayable(id)
    }
  }

  const handleRestorePayable = (id) => {
    restorePayable(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this payable?')) {
      permanentDeletePayable(id)
    }
  }

  const handleViewDetails = (payable) => {
    setSelectedPayable(payable)
    setIsDetailsModalOpen(true)
  }

  const handleMarkAsPaid = async (id) => {
    if (window.confirm('Mark this as paid?')) {
      await markAsPaid(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPayable(null)
  }

  // Get due soon (within 5 days)
  const getDueSoon = () => {
    const today = new Date()
    const fiveDaysFromNow = new Date(today)
    fiveDaysFromNow.setDate(today.getDate() + 5)
    
    return payables.filter(p => {
      if (p.status === 'paid') return false
      if (!p.due_date) return false
      const dueDate = new Date(p.due_date)
      return dueDate >= today && dueDate <= fiveDaysFromNow
    })
  }

  const dueSoon = getDueSoon()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payables</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track bills, loans, and other monthly obligations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedPayables.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payable
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!showTrash && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Obligations</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₱{totals.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4 bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
            <p className="text-xl font-bold text-green-600">₱{totals.totalPaid?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid</p>
            <p className="text-xl font-bold text-red-600">₱{totals.totalUnpaid?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            <p className="text-xl font-bold text-red-500">{totals.overdueCount || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Due Soon</p>
            <p className="text-xl font-bold text-yellow-500">{dueSoon.length}</p>
          </div>
        </div>
      )}

      {/* Due Soon Alert */}
      {!showTrash && dueSoon.length > 0 && (
        <div className="card border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">⚠️ {dueSoon.length} payables due within 5 days!</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {dueSoon.map(p => (
              <span key={p.id} className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                {p.name}: ₱{p.amount.toLocaleString()} - {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showTrash ? "Search trash..." : "Search payables by name, category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Payable List */}
      {filteredPayables.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CreditCard className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No payables found' : showTrash ? 'Trash is empty' : 'No payables yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted payables will appear here' : 'Start by adding your first payable'
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
                  <th className="table-header">Name</th>
                  <th className="table-header">Category</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.map((payable) => {
                  const isDeleted = payable.is_deleted
                  
                  return (
                    <tr key={payable.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell font-medium">
                        {payable.name || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getCategoryColor(payable.category)}`}>
                          {payable.category || 'Other'}
                        </span>
                      </td>
                      <td className="table-cell text-right font-medium text-gray-900 dark:text-white">
                        ₱{payable.amount?.toLocaleString() || 0}
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {payable.due_date ? new Date(payable.due_date).toLocaleDateString() : 'N/A'}
                        {payable.frequency && payable.frequency !== 'one-time' && (
                          <span className="text-xs ml-1 text-gray-400">({payable.frequency})</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(payable.status)}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(payable)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>

                          {!isDeleted && payable.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(payable.id)}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </button>
                          )}

                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestorePayable(payable.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(payable.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditPayable(payable)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeletePayable(payable.id)}
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
      <PayableModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingPayable ? handleUpdatePayable : handleAddPayable}
        payable={editingPayable}
      />

      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedPayable(null)
        }}
        transaction={selectedPayable}
        type="payable"
      />
    </div>
  )
}

export default Payables
