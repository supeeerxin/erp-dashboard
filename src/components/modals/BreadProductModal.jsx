import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const BreadProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerBox: '',
    pricePerPiece: ''
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        pricePerBox: product.pricePerBox || '',
        pricePerPiece: product.pricePerPiece || ''
      })
    } else {
      setFormData({
        name: '',
        pricePerBox: '',
        pricePerPiece: ''
      })
    }
  }, [product, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter product name')
      return
    }
    onSave({
      name: formData.name.trim(),
      pricePerBox: parseFloat(formData.pricePerBox) || 0,
      pricePerPiece: parseFloat(formData.pricePerPiece) || 0
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Bread Product' : 'Add Bread Product'}
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
            <label className="label">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Pandesal"
              required
            />
          </div>

          <div>
            <label className="label">Price per Box (₱)</label>
            <input
              type="number"
              name="pricePerBox"
              value={formData.pricePerBox}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="label">Price per Piece (₱)</label>
            <input
              type="number"
              name="pricePerPiece"
              value={formData.pricePerPiece}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {product ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BreadProductModal
