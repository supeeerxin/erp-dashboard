import React, { useState } from 'react'
import { TrendingUp, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive, Calendar, Tag } from 'lucide-react'
import { useIncome } from '../../context/IncomeContext'
import IncomeModal from '../../components/modals/IncomeModal'
import TransactionHistoryModal from '../../components/modals/TransactionHistoryModal'

const Income = () => {
  const { 
    incomes, 
    deletedIncomes,
    addIncome, 
    updateIncome, 
    deleteIncome,
    restoreIncome,
    permanentDeleteIncome,
    getTotals 
  } = useIncome()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [selectedIncome, setSelectedIncome] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedIncomes : incomes

  const filteredIncomes = currentList.filter(i => {
    const search = searchQuery.toLowerCase()
    return i.source?.toLowerCase().includes(search) ||
           i.category?.toLowerCase().includes(search) ||
           i.description?.toLowerCase().includes(search) ||
           i.transactionNumber?.toLowerCase().includes(search)
  })

  const getCategoryColor = (category) => {
    const colors = {
      'Sales': 'badge-success',
      'Rent': 'badge-info',
      'Investment': 'badge-warning',
      'Interest': 'badge-info',
      'Consulting': 'badge-primary',
      'Freelance': 'badge-warning',
      'Salary': 'badge-success',
      'Business': 'badge-primary',
      'Refund': 'badge-info',
      'Other': 'badge-secondary'
    }
    return colors[category] || 'badge-secondary'
  }

  const handleAddIncome = (data) => {
    addIncome(data)
  }

  const handleEditIncome = (income) => {
    setEditingIncome(income)
    setIsModalOpen(true)
  }

  const handleUpdateIncome = (data) => {
    updateIncome(editingIncome.id, data)
    setEditingIncome(null)
  }

  const handleDeleteIncome = (id) => {
    if (window.confirm('Move this income to trash?')) {
      deleteIncome(id)
    }
  }

  const handleRestoreIncome = (id) => {
    restoreIncome(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this income?')) {
      permanentDeleteIncome(id)
    }
  }

  const handleViewHistory = (income) => {
    setSelectedIncome(income)
    setIsHistoryModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingIncome(null)
  }

  // Get top categories
  const topCategories = Object.entries(totals.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all income sources
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedIncomes.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Income
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!showTrash && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-green-600">₱{totals.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.count || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.keys(totals.byCategory || {}).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Category</p>
            <p className="text-lg font-bold text-primary-500">
              {topCategories.length > 0 ? topCategories[0][0] : 'None'}
            </p>
          </div>
        </div>
      )}

      {/* Top Categories */}
      {!showTrash && topCategories.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top Income Categories</h4>
          <div className="flex flex-wrap gap-2">
            {topCategories.map(([category, amount]) => (
              <span key={category} className={`badge ${getCategoryColor(category)} text-sm px-3 py-1`}>
                {category}: ₱{amount.toLocaleString()}
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
            placeholder={showTrash ? "Search trash..." : "Search income by source, category, or transaction #..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Income List */}
      {filteredIncomes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <TrendingUp className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No income found' : showTrash ? 'Trash is empty' : 'No income recorded yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted income will appear here' : 'Start by recording your first income'
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
                  <th className="table-header">Source</th>
                  <th className="table-header">Category</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income) => {
                  const isDeleted = income.isDeleted
                  
                  return (
                    <tr key={income.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">
                        {income.transactionNumber || `INC-${income.id.toString().slice(-6)}`}
                      </td>
                      <td className="table-cell font-medium">
                        {income.source || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getCategoryColor(income.category)}`}>
                          {income.category || 'Other'}
                        </span>
                      </td>
                      <td className="table-cell text-right font-medium text-green-600">
                        ₱{income.amount?.toLocaleString() || 0}
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {income.date ? new Date(income.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHistory(income)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>

                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreIncome(income.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(income.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditIncome(income)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteIncome(income.id)}
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
      <IncomeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingIncome ? handleUpdateIncome : handleAddIncome}
        income={editingIncome}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedIncome(null)
        }}
        transaction={selectedIncome}
      />
    </div>
  )
}

export default Income
