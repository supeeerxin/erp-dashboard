import React from 'react'
import { Package, Plus, Search } from 'lucide-react'

const RiceCredit = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rice Credit Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage rice credit transactions and track balances
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Rice Credit
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rice credit transactions..."
              className="input-field pl-10"
            />
          </div>
          <select className="input-field sm:w-48">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="empty-state">
          <Package className="empty-state-icon" />
          <p className="empty-state-text">No rice credit transactions yet</p>
          <p className="empty-state-subtext">
            Start by creating your first rice credit transaction
          </p>
          <button className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

export default RiceCredit