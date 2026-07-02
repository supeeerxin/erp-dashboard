import React from 'react'
import { FileText } from 'lucide-react'

const AuditLog = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
      </div>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">Audit log page is working!</p>
      </div>
    </div>
  )
}

export default AuditLog
