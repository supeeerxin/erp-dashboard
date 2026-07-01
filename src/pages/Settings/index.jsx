import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Database, Download, Upload, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotification } from '../../context/NotificationContext'

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { showNotification } = useNotification()
  const [backupData, setBackupData] = useState(null)

  const handleExportBackup = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        // Mock data - will be replaced with actual data
        customers: [],
        transactions: [],
        settings: { darkMode }
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification('Backup exported successfully!', 'success')
  }

  const handleImportBackup = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        setBackupData(data)
        showNotification('Backup imported successfully!', 'success')
      } catch (error) {
        showNotification('Invalid backup file', 'error')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Appearance
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative w-12 h-6 rounded-full transition-colors bg-gray-300 dark:bg-primary-500"
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value="Admin User" className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value="admin@erp.com" className="input-field" />
            </div>
            <button className="btn-primary">Update Profile</button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5" /> Backup & Restore
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="font-medium text-gray-700 dark:text-gray-300">Export Backup</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download all data as JSON</p>
              <button 
                onClick={handleExportBackup}
                className="btn-secondary mt-3 inline-flex items-center gap-2 w-full justify-center"
              >
                <Download className="w-4 h-4" /> Export Backup
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="font-medium text-gray-700 dark:text-gray-300">Import Backup</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Restore data from JSON file</p>
              <label className="btn-secondary mt-3 inline-flex items-center gap-2 w-full justify-center cursor-pointer">
                <Upload className="w-4 h-4" /> Import Backup
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h3>
          <div className="mt-4 space-y-3">
            {['Email Notifications', 'Push Notifications', 'Payment Reminders', 'Weekly Reports'].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <div className="relative w-10 h-5 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer">
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> Security
          </h3>
          <div className="mt-4 space-y-3">
            <button className="btn-secondary w-full">Change Password</button>
            <button className="btn-secondary w-full">Two-Factor Authentication</button>
            <button className="btn-secondary w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Clear All Data</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings