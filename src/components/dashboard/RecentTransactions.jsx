import React from 'react'
import { Eye, MoreVertical, CheckCircle, Clock, AlertCircle, Package, DollarSign, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RecentTransactions = ({ data }) => {
  const navigate = useNavigate()

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rice-credit':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'cash-loan':
        return <DollarSign className="w-4 h-4 text-green-500" />
      case 'bread-order':
        return <ShoppingBag className="w-4 h-4 text-yellow-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'rice-credit':
        return 'Rice Credit'
      case 'cash-loan':
        return 'Cash Loan'
      case 'bread-order':
        return 'Bread Order'
      default:
        return type
    }
  }

  const handleView = (item) => {
    // Navigate to the appropriate page
    if (item.type === 'rice-credit') {
      navigate('/rice-credit')
    } else if (item.type === 'cash-loan') {
      navigate('/cash-loans')
    } else if (item.type === 'bread-order') {
      navigate('/bread-orders')
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <button 
          onClick={() => navigate('/reports')}
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="table-header">Type</th>
              <th className="table-header">Customer</th>
              <th className="table-header text-right">Amount</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent transactions
                </td>
              </tr>
            ) : (
              data.slice(0, 10).map((item, index) => (
                <tr 
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell font-medium">
                    {item.customer || 'N/A'}
                  </td>
                  <td className="table-cell text-right font-medium text-gray-900 dark:text-white">
                    ₱{item.amount?.toLocaleString() || 0}
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="table-cell text-gray-500 dark:text-gray-400">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => handleView(item)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentTransactions
