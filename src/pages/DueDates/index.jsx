import React from 'react'
import { Calendar } from 'lucide-react'

const DueDates = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Due Dates</h1>
      </div>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">Due dates page is working!</p>
      </div>
    </div>
  )
}

export default DueDates
