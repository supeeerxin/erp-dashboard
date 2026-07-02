import React, { useState } from 'react'
import { TrendingDown, Plus, Search, Edit2, Trash2, RotateCcw, Eye, Archive } from 'lucide-react'
import { useExpenses } from '../../context/ExpenseContext'
import ExpenseModal from '../../components/modals/ExpenseModal'
import TransactionHistoryModal from '../../components/modals/TransactionHistoryModal'

const Expenses = () => {
  const { 
    expenses, 
    deletedExpenses,
    addExpense, 
    updateExpense, 
    deleteExpense,
    restoreExpense,
    permanentDeleteExpense,
    getTotals 
  } = useExpenses()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)

  const totals = getTotals()
  const currentList = showTrash ? deletedExpenses : expenses

  const filteredExpenses = currentList.filter(e => {
    const search = searchQuery.toLowerCase()
    return e.item?.toLowerCase().includes(search) ||
           e.category?.toLowerCase().includes(search) ||
           e.description?.toLowerCase().includes(search) ||
           e.transactionNumber?.toLowerCase().includes(search)
  })

  const getCategoryColor = (category) => {
    const colors = {
      'Supplies': 'badge-warning',
      'Utilities': 'badge-info',
      'Rent': 'badge-danger',
      'Salary': 'badge-primary',
      'Transportation': 'badge-warning',
      'Marketing': 'badge-info',
      'Maintenance': 'badge-secondary',
      'Insurance': 'badge-info',
      'Taxes': 'badge-danger',
      'Food': 'badge-warning',
      'Equipment': 'badge-primary',
      'Other': 'badge-secondary'
    }
    return colors[category] || 'badge-secondary'
  }

  const handleAddExpense = (data) => {
    addExpense(data)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleUpdateExpense = (data) => {
    updateExpense(editingExpense.id, data)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id) => {
    if (window.confirm('Move this expense to trash?')) {
      deleteExpense(id)
    }
  }

  const handleRestoreExpense = (id) => {
    restoreExpense(id)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this expense?')) {
      permanentDeleteExpense(id)
    }
  }

  const handleViewHistory = (expense) => {
    setSelectedExpense(expense)
    setIsHistoryModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all expenses
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : `Trash (${deletedExpenses.length})`}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!showTrash && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">₱{totals.totalAmount?.toLocaleString() || 0}</p>
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
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top Expense Categories</h4>
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
            placeholder={showTrash ? "Search trash..." : "Search expenses by item, category, or transaction #..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <TrendingDown className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No expenses found' : showTrash ? 'Trash is empty' : 'No expenses recorded yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted expenses will appear here' : 'Start by recording your first expense'
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
                  <th className="table-header">Item</th>
                  <th className="table-header">Category</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const isDeleted = expense.isDeleted
                  
                  return (
                    <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">
                        {expense.transactionNumber || `EXP-${expense.id.toString().slice(-6)}`}
                      </td>
                      <td className="table-cell font-medium">
                        {expense.item || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getCategoryColor(expense.category)}`}>
                          {expense.category || 'Other'}
                        </span>
                      </td>
                      <td className="table-cell text-right font-medium text-red-600">
                        ₱{expense.amount?.toLocaleString() || 0}
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewHistory(expense)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>

                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreExpense(expense.id)}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(expense.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
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
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingExpense ? handleUpdateExpense : handleAddExpense}
        expense={editingExpense}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedExpense(null)
        }}
        transaction={selectedExpense}
      />
    </div>
  )
}

export default Expenses
