import React, { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, Trash2, Download, Eye, Clock, User, Package, DollarSign, Users, TrendingUp, TrendingDown, CreditCard, ShoppingBag } from 'lucide-react'
import { useAudit } from '../../context/AuditContext'
import { useNotification } from '../../context/NotificationContext'

const AuditLog = () => {
  const { logs, clearLogs } = useAudit()
  const { showNotification } = useNotification()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const modules = useMemo(() => {
    const unique = new Set(logs.map(log => log.module))
    return ['all', ...Array.from(unique)]
  }, [logs])

  const actions = useMemo(() => {
    const unique = new Set(logs.map(log => log.action))
    return ['all', ...Array.from(unique)]
  }, [logs])

  const filteredLogs = useMemo(() => {
    let filtered = logs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log => 
        log.details?.toLowerCase().includes(query) ||
        log.user?.toLowerCase().includes(query) ||
        log.module?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query)
      )
    }

    if (filterModule !== 'all') {
      filtered = filtered.filter(log => log.module === filterModule)
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateFrom))
    }

    if (dateTo) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateTo))
    }

    return filtered
  }, [logs, searchQuery, filterModule, filterAction, dateFrom, dateTo])

  const getModuleIcon = (module) => {
    const icons = {
      'Customer': Users,
      'Rice Credit': Package,
      'Cash Loan': DollarSign,
      'Bread Order': ShoppingBag,
      'Income': TrendingUp,
      'Expense': TrendingDown,
      'Payable': CreditCard,
      'Settings': FileText
    }
    return icons[module] || FileText
  }

  const getModuleColor = (module) => {
    const colors = {
      'Customer': 'text-purple-500',
      'Rice Credit': 'text-blue-500',
      'Cash Loan': 'text-green-500',
      'Bread Order': 'text-yellow-500',
      'Income': 'text-indigo-500',
      'Expense': 'text-red-500',
      'Payable': 'text-orange-500',
      'Settings': 'text-gray-500'
    }
    return colors[module] || 'text-gray-500'
  }

  const getActionBadge = (action) => {
    const styles = {
      'Created': 'badge-success',
      'Updated': 'badge-warning',
      'Deleted': 'badge-danger',
      'Restored': 'badge-info',
      'Paid': 'badge-success',
      'Login': 'badge-info',
      'Logout': 'badge-secondary',
      'Exported': 'badge-info',
      'Imported': 'badge-info',
      'Cleared': 'badge-danger'
    }
    return styles[action] || 'badge-secondary'
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs?')) {
      clearLogs()
      showNotification('Audit logs cleared!', 'success')
    }
  }

  const handleExportLogs = () => {
    const data = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      user: log.user,
      module: log.module,
      action: log.action,
      details: log.details
    }))

    let csv = 'Timestamp,User,Module,Action,Details\n'
    data.forEach(row => {
      csv += `${row.timestamp},${row.user},${row.module},${row.action},"${row.details}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Audit log exported!', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-500" />
            Audit Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete record of all system activities and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportLogs} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleClearLogs} className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Filtered Logs</p>
          <p className="text-2xl font-bold text-primary-500">{filteredLogs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Modules</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{modules.length - 1}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
          <p className="text-2xl font-bold text-green-500">
            {logs.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="input-field lg:w-40">
            <option value="all">All Modules</option>
            {modules.filter(m => m !== 'all').map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="input-field lg:w-40">
            <option value="all">All Actions</option>
            {actions.filter(a => a !== 'all').map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field lg:w-36" placeholder="From" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field lg:w-36" placeholder="To" />
          </div>
        </div>
      </div>

      <div className="card">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <p className="empty-state-text">No logs found</p>
            <p className="empty-state-subtext">
              {logs.length === 0 ? 'No activities recorded yet.' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Module</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const Icon = getModuleIcon(log.module)
                  const color = getModuleColor(log.module)
                  
                  return (
                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="table-cell text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{log.user || 'Admin'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="text-gray-700 dark:text-gray-300">{log.module}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="table-cell text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLog
