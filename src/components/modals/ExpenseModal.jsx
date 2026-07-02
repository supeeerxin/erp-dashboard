import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const ExpenseModal = ({ isOpen, onClose, onSave, expense }) => {
  const [formData, setFormData] = useState({
    item: '',
    category: 'Supplies',
    amount: '',
    date: '',
    description: ''
  })

  const categories = [
    'Supplies',
    'Utilities',
    'Rent',
    'Salary',
    'Transportation',
    'Marketing',
    'Maintenance',
    'Insurance',
    'Taxes',
    'Food',
    'Equipment',
    'Other'
  ]

  useEffect(() => {
    if (expense) {
      setFormData({
        item: expense.item || '',
        category: expense.category || 'Supplies',
        amount: expense.amount || '',
        date: expense.date || '',
        description: expense.description || ''
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        item: '',
        category: 'Supplies',
        amount: '',
        date: today,
        description: ''
      })
    }
  }, [expense, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.item || !formData.amount) {
      alert('Please enter item and amount')
      return
    }
    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0')
      return
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount)
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Item *</label>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Office Supplies"
              required
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (₱) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="Additional notes..."
              rows="2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {expense ? 'Update' : 'Create'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseModal
