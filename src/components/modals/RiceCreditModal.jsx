import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'

const RiceCreditModal = ({ isOpen, onClose, onSave, transaction }) => {
  const { customers } = useCustomers()
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    cost: '',
    downPayment: '',
    numberOfPayments: '1',
    description: '',
    dueDate: ''
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        customerId: transaction.customerId || '',
        customerName: transaction.customerName || '',
        amount: transaction.amount || '',
        cost: transaction.cost || '',
        downPayment: transaction.downPayment || '',
        numberOfPayments: transaction.numberOfPayments || '1',
        description: transaction.description || '',
        dueDate: transaction.dueDate || ''
      })
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        amount: '',
        cost: '',
        downPayment: '',
        numberOfPayments: '1',
        description: '',
        dueDate: ''
      })
    }
  }, [transaction, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value
    const customer = customers.find(c => c.id === parseInt(customerId))
    setFormData(prev => ({
      ...prev,
      customerId: customerId,
      customerName: customer ? customer.name : ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.customerId || !formData.amount) {
      alert('Please select a customer and enter amount')
      return
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      cost: parseFloat(formData.cost) || 0,
      downPayment: parseFloat(formData.downPayment) || 0,
      numberOfPayments: parseInt(formData.numberOfPayments) || 1
    })
    onClose()
  }

  if (!isOpen) return null

  // Compute values
  const amount = parseFloat(formData.amount) || 0
  const cost = parseFloat(formData.cost) || 0
  const downPayment = parseFloat(formData.downPayment) || 0
  const numberOfPayments = parseInt(formData.numberOfPayments) || 1
  const remainingAfterDown = amount - downPayment
  const paymentPerGive = numberOfPayments > 1 ? remainingAfterDown / numberOfPayments : remainingAfterDown
  const potentialProfit = amount - cost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Edit Rice Credit' : 'New Rice Credit'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Customer *</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleCustomerSelect}
              className="input-field"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Total Amount (₱) *</label>
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
            <label className="label">Puhunan / Cost (₱)</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Terms</h4>
            
            <div>
              <label className="label">Down Payment (₱)</label>
              <input
                type="number"
                name="downPayment"
                value={formData.downPayment}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mt-3">
              <label className="label">Number of Gives/Payments</label>
              <input
                type="number"
                name="numberOfPayments"
                value={formData.numberOfPayments}
                onChange={handleChange}
                className="input-field"
                placeholder="1"
                min="1"
                step="1"
              />
            </div>

            {amount > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining after down: <span className="font-medium text-gray-900 dark:text-white">₱{remainingAfterDown.toFixed(2)}</span>
                </p>
                {numberOfPayments > 1 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Per Give: <span className="font-medium text-primary-500">₱{paymentPerGive.toFixed(2)}</span>
                  </p>
                )}
                {cost > 0 && (
                  <p className={`text-sm ${potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Potential Profit: ₱{potentialProfit.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
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
              placeholder="Optional description"
              rows="2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {transaction ? 'Update' : 'Create'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RiceCreditModal
