import React from 'react'
import { Eye, MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const RecentTransactions = ({ data }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="badge badge-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        )
      case 'pending':
        return (
          <span className="badge badge-warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'overdue':
        return (
          <span className="badge badge-danger">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        )
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="table-header">Customer</th>
              <th className="table-header text-right">Amount</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((transaction) => (
              <tr 
                key={transaction.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="table-cell font-medium">
                  {transaction.customer}
                </td>
                <td className="table-cell text-right font-medium text-gray-900 dark:text-white">
                  ₱{transaction.amount.toLocaleString()}
                </td>
                <td className="table-cell">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="table-cell text-gray-500 dark:text-gray-400">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentTransactions