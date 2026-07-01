import React from 'react'
import { TrendingDown, Plus, Search } from 'lucide-react'

const Expenses = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all expenses</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search expenses..." className="input-field pl-10" />
          </div>
        </div>
        <div className="empty-state">
          <TrendingDown className="empty-state-icon" />
          <p className="empty-state-text">No expenses recorded yet</p>
          <p className="empty-state-subtext">Start by recording your first expense</p>
          <button className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>
    </div>
  )
}

export default Expenses