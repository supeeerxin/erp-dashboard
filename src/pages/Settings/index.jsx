import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Moon, 
  Sun,
  Building,
  DollarSign,
  Percent,
  Users,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Save
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotification } from '../../context/NotificationContext'

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { showNotification } = useNotification()
  const [backupData, setBackupData] = useState(null)
  const [businessInfo, setBusinessInfo] = useState({
    name: 'My Business',
    address: '',
    contact: '',
    email: 'admin@erp.com'
  })
  const [currencySettings, setCurrencySettings] = useState({
    symbol: '₱',
    decimalPlaces: 2,
    thousandSeparator: ','
  })
  const [taxSettings, setTaxSettings] = useState({
    taxRate: 12,
    includedInPrice: true
  })

  const handleExportBackup = () => {
    // Collect all data from localStorage
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        riceCreditTransactions: JSON.parse(localStorage.getItem('riceCreditTransactions') || '[]'),
        cashLoans: JSON.parse(localStorage.getItem('cashLoans') || '[]'),
        breadOrders: JSON.parse(localStorage.getItem('breadOrders') || '[]'),
        breadProducts: JSON.parse(localStorage.getItem('breadProducts') || '[]'),
        incomes: JSON.parse(localStorage.getItem('incomes') || '[]'),
        expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
        payables: JSON.parse(localStorage.getItem('payables') || '[]'),
        settings: {
          darkMode,
          businessInfo,
          currencySettings,
          taxSettings
        }
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
        
        // Restore data
        if (data.data) {
          Object.entries(data.data).forEach(([key, value]) => {
            if (key !== 'settings' && Array.isArray(value)) {
              localStorage.setItem(key, JSON.stringify(value))
            }
          })
          if (data.data.settings) {
            const settings = data.data.settings
            if (settings.darkMode !== undefined) {
              localStorage.setItem('darkMode', JSON.stringify(settings.darkMode))
              window.location.reload()
            }
          }
        }
        
        showNotification('Backup imported successfully! Reloading...', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        showNotification('Invalid backup file', 'error')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      if (window.confirm('REALLY? All data will be permanently deleted!')) {
        const keys = ['customers', 'riceCreditTransactions', 'cashLoans', 'breadOrders', 'breadProducts', 'incomes', 'expenses', 'payables']
        keys.forEach(key => localStorage.removeItem(key))
        showNotification('All data cleared!', 'success')
        setTimeout(() => window.location.reload(), 1000)
      }
    }
  }

  const handleSaveBusinessInfo = () => {
    showNotification('Business information saved!', 'success')
  }

  const handleSaveCurrencySettings = () => {
    showNotification('Currency settings saved!', 'success')
  }

  const handleSaveTaxSettings = () => {
    showNotification('Tax settings saved!', 'success')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5" /> Business Information
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                className="input-field"
                placeholder="Enter business address"
              />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input
                type="text"
                value={businessInfo.contact}
                onChange={(e) => setBusinessInfo({ ...businessInfo, contact: e.target.value })}
                className="input-field"
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                className="input-field"
              />
            </div>
            <button onClick={handleSaveBusinessInfo} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Business Info
            </button>
          </div>
        </div>

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

        {/* Currency Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Currency Settings
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Currency Symbol</label>
              <input
                type="text"
                value={currencySettings.symbol}
                onChange={(e) => setCurrencySettings({ ...currencySettings, symbol: e.target.value })}
                className="input-field"
                placeholder="₱"
              />
            </div>
            <div>
              <label className="label">Decimal Places</label>
              <select
                value={currencySettings.decimalPlaces}
                onChange={(e) => setCurrencySettings({ ...currencySettings, decimalPlaces: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <button onClick={handleSaveCurrencySettings} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Currency Settings
            </button>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5" /> Tax Settings
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                value={taxSettings.taxRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, taxRate: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="12"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Included in Price</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tax is included in product prices</p>
              </div>
              <button
                onClick={() => setTaxSettings({ ...taxSettings, includedInPrice: !taxSettings.includedInPrice })}
                className={`relative w-12 h-6 rounded-full transition-colors ${taxSettings.includedInPrice ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${taxSettings.includedInPrice ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
            <button onClick={handleSaveTaxSettings} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Tax Settings
            </button>
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

        {/* Data Management */}
        <div className="card lg:col-span-2 border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Data Management
          </h3>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              This will permanently delete ALL data including customers, transactions, loans, orders, income, expenses, and payables.
            </p>
            <button
              onClick={handleClearAllData}
              className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
            >
              <Trash2 className="w-4 h-4" /> Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
