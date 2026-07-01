import React from 'react'
import { BarChart3, Download, Printer, FileSpreadsheet } from 'lucide-react'

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and view business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Sales Report', description: 'View all sales transactions', icon: BarChart3 },
          { title: 'Financial Report', description: 'Income and expense summary', icon: BarChart3 },
          { title: 'Customer Report', description: 'Customer activity and trends', icon: BarChart3 },
          { title: 'Inventory Report', description: 'Stock and product status', icon: BarChart3 },
          { title: 'Loan Report', description: 'Credit and loan summaries', icon: BarChart3 },
          { title: 'Tax Report', description: 'Tax calculations and filings', icon: BarChart3 }
        ].map((report, index) => (
          <div key={index} className="card card-hover cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <report.icon className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
                <button className="text-sm text-primary-500 hover:text-primary-600 font-medium mt-2 inline-flex items-center gap-1">
                  Generate Report <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
          <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">View All</button>
        </div>
        <div className="empty-state">
          <BarChart3 className="empty-state-icon" />
          <p className="empty-state-text">No reports generated yet</p>
          <p className="empty-state-subtext">Generate your first report to see data here</p>
        </div>
      </div>
    </div>
  )
}

export default Reports