import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const PaymentModal = ({ isOpen, onClose, onSave, customerName, remainingBalance, suggestedAmount }) => {
  const [amount, setAmount] = useState('')

  // Auto-fill suggested amount when modal opens
  useEffect(() => {
    if (isOpen && suggestedAmount > 0) {
      setAmount(suggestedAmount.toString())
    } else {
      setAmount('')
    }
  }, [isOpen, suggestedAmount])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    if (parseFloat(amount) > remainingBalance) {
      alert(`Amount cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`)
      return
    }
    onSave(parseFloat(amount))
    setAmount('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Record Payment
          </h3>
          <button
            onClick={() => {
              setAmount('')
              onClose()
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customer: <span className="font-medium text-gray-900 dark:text-white">{customerName}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Remaining Balance: <span className="font-bold text-primary-500">₱{remainingBalance.toLocaleString()}</span>
            </p>
            {suggestedAmount > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Suggested Payment: <span className="font-bold">₱{suggestedAmount.toLocaleString()}</span>
                <span className="text-xs ml-1">(per give/month)</span>
              </p>
            )}
          </div>

          <div>
            <label className="label">Payment Amount (₱) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="0.00"
              min="0"
              max={remainingBalance}
              step="0.01"
              required
              autoFocus
            />
            {remainingBalance > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max: ₱{remainingBalance.toLocaleString()}
              </p>
            )}
            {suggestedAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(suggestedAmount.toString())}
                className="text-xs text-primary-500 hover:text-primary-600 mt-1"
              >
                Use suggested amount
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => {
                setAmount('')
                onClose()
              }} 
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
