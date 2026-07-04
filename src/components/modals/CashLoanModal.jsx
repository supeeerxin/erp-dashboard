import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'
import { addDays, addMonths, format } from 'date-fns'

const CashLoanModal = ({ isOpen, onClose, onSave, loan }) => {
  const { customers } = useCustomers()
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    principal: '',
    interestRate: '',
    interestType: 'percentage',
    downPayment: '',
    numberOfPayments: '1',
    paymentTerm: 'months',
    termValue: '1',
    dueDate: '',
    description: ''
  })

  useEffect(() => {
    if (loan) {
      setFormData({
        customerId: loan.customerId || '',
        customerName: loan.customerName || '',
        principal: loan.principal || '',
        interestRate: loan.interestRate || '',
        interestType: loan.interestType || 'percentage',
        downPayment: loan.downPayment || '',
        numberOfPayments: loan.numberOfPayments || '1',
        paymentTerm: loan.paymentTerm || 'months',
        termValue: loan.termValue || '1',
        dueDate: loan.dueDate || '',
        description: loan.description || ''
      })
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        principal: '',
        interestRate: '',
        interestType: 'percentage',
        downPayment: '',
        numberOfPayments: '1',
        paymentTerm: 'months',
        termValue: '1',
        dueDate: '',
        description: ''
      })
    }
  }, [loan, isOpen])

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

  // Auto-compute due date
  useEffect(() => {
    if (formData.termValue && formData.paymentTerm) {
      const today = new Date()
      let dueDate = today
      const termValue = parseInt(formData.termValue) || 0
      
      if (formData.paymentTerm === 'months') {
        dueDate = addMonths(today, termValue)
      } else if (formData.paymentTerm === 'days') {
        dueDate = addDays(today, termValue)
      }
      
      setFormData(prev => ({
        ...prev,
        dueDate: format(dueDate, 'yyyy-MM-dd')
      }))
    }
  }, [formData.termValue, formData.paymentTerm])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.customerId || !formData.principal) {
      alert('Please select a customer and enter principal amount')
      return
    }
    if (!formData.dueDate) {
      alert('Please set a due date')
      return
    }
    onSave({
      ...formData,
      principal: parseFloat(formData.principal),
      interestRate: parseFloat(formData.interestRate) || 0,
      downPayment: parseFloat(formData.downPayment) || 0,
      numberOfPayments: parseInt(formData.numberOfPayments) || 1,
      termValue: parseInt(formData.termValue) || 1,
      dueDate: formData.dueDate
    })
    onClose()
  }

  if (!isOpen) return null

  const principal = parseFloat(formData.principal) || 0
  const interestRate = parseFloat(formData.interestRate) || 0
  const interestType = formData.interestType
  const downPayment = parseFloat(formData.downPayment) || 0
  const numberOfPayments = parseInt(formData.numberOfPayments) || 1
  const termValue = parseInt(formData.termValue) || 1
  
  const interestAmount = interestType === 'percentage' 
    ? (principal * interestRate / 100) 
    : interestRate
  
  const totalPayable = principal + interestAmount
  const remainingAfterDown = totalPayable - downPayment
  const paymentPerGive = numberOfPayments > 1 ? remainingAfterDown / numberOfPayments : remainingAfterDown

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {loan ? 'Edit Cash Loan' : 'New Cash Loan'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
            <label className="label">Principal Amount (₱) *</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="label">Interest Rate</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <select
                name="interestType"
                value={formData.interestType}
                onChange={handleChange}
                className="input-field w-32"
              >
                <option value="percentage">%</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            {principal > 0 && interestRate > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Interest: ₱{interestAmount.toFixed(2)}
                {interestType === 'percentage' && ` (${interestRate}%)`}
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Terms</h4>
            
            <div>
              <label className="label">Payment Term</label>
              <div className="flex gap-2">
                <select
                  name="paymentTerm"
                  value={formData.paymentTerm}
                  onChange={handleChange}
                  className="input-field w-32"
                >
                  <option value="months">Months</option>
                  <option value="days">Days</option>
                </select>
                <input
                  type="number"
                  name="termValue"
                  value={formData.termValue}
                  onChange={handleChange}
                  className="input-field flex-1"
                  placeholder="1"
                  min="1"
                  step="1"
                />
              </div>
              {formData.dueDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Due Date: <span className="font-medium text-primary-500">{new Date(formData.dueDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>

            <div className="mt-3">
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

            {principal > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Payable: <span className="font-medium text-gray-900 dark:text-white">₱{totalPayable.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interest: <span className="font-medium text-yellow-600 dark:text-yellow-400">₱{interestAmount.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining after down: <span className="font-medium text-gray-900 dark:text-white">₱{remainingAfterDown.toFixed(2)}</span>
                </p>
                {numberOfPayments > 1 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Per Give: <span className="font-medium text-primary-500">₱{paymentPerGive.toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}
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
              {loan ? 'Update' : 'Create'} Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CashLoanModal
