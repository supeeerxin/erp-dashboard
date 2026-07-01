import React from 'react'
import { DollarSign, Plus, Search } from 'lucide-react'

const CashLoans = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cash Loan Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage cash loans and track repayments
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Cash Loan
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cash loans..."
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
          <DollarSign className="empty-state-icon" />
          <p className="empty-state-text">No cash loans yet</p>
          <p className="empty-state-subtext">
            Start by creating your first cash loan
          </p>
          <button className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Loan
          </button>
        </div>
      </div>
    </div>
  )
}

export default CashLoans