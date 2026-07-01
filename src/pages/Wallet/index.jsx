import React from 'react'
import { Wallet as WalletIcon, Plus, TrendingUp, TrendingDown } from 'lucide-react'

const Wallet = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your wallet and track balances</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Funds
        </button>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Balance</p>
          <p className="text-3xl font-bold mt-2">₱32,688.89</p>
          <p className="text-xs opacity-75 mt-1">Updated just now</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₱45,231.89</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₱12,543.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <WalletIcon className="empty-state-icon" />
          <p className="empty-state-text">No transactions yet</p>
          <p className="empty-state-subtext">Your wallet transactions will appear here</p>
        </div>
      </div>
    </div>
  )
}

export default Wallet