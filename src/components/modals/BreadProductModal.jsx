import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const BreadProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    sellingPricePerBox: '',
    sellingPricePerPiece: '',
    costPerBox: '',
    costPerPiece: '',
    piecesPerBox: '24',
    stockBoxes: '',
    stockPieces: ''
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sellingPricePerBox: product.selling_price_per_box || '',
        sellingPricePerPiece: product.selling_price_per_piece || '',
        costPerBox: product.cost_per_box || '',
        costPerPiece: product.cost_per_piece || '',
        piecesPerBox: product.pieces_per_box || '24',
        stockBoxes: product.stock_boxes || '',
        stockPieces: product.stock_pieces || ''
      })
    } else {
      setFormData({
        name: '',
        sellingPricePerBox: '',
        sellingPricePerPiece: '',
        costPerBox: '',
        costPerPiece: '',
        piecesPerBox: '24',
        stockBoxes: '',
        stockPieces: ''
      })
    }
  }, [product, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-compute price per piece when sellingPricePerBox or piecesPerBox changes
      if (name === 'sellingPricePerBox' || name === 'piecesPerBox') {
        const priceBox = parseFloat(name === 'sellingPricePerBox' ? value : prev.sellingPricePerBox) || 0
        const pieces = parseInt(name === 'piecesPerBox' ? value : prev.piecesPerBox) || 1
        if (priceBox > 0 && pieces > 0) {
          newData.sellingPricePerPiece = (priceBox / pieces).toFixed(2)
        }
      }
      
      // Auto-compute cost per piece
      if (name === 'costPerBox' || name === 'piecesPerBox') {
        const costBox = parseFloat(name === 'costPerBox' ? value : prev.costPerBox) || 0
        const pieces = parseInt(name === 'piecesPerBox' ? value : prev.piecesPerBox) || 1
        if (costBox > 0 && pieces > 0) {
          newData.costPerPiece = (costBox / pieces).toFixed(2)
        }
      }
      
      return newData
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter product name')
      return
    }
    onSave({
      name: formData.name.trim(),
      sellingPricePerBox: parseFloat(formData.sellingPricePerBox) || 0,
      sellingPricePerPiece: parseFloat(formData.sellingPricePerPiece) || 0,
      costPerBox: parseFloat(formData.costPerBox) || 0,
      costPerPiece: parseFloat(formData.costPerPiece) || 0,
      piecesPerBox: parseInt(formData.piecesPerBox) || 24,
      stockBoxes: parseInt(formData.stockBoxes) || 0,
      stockPieces: parseInt(formData.stockPieces) || 0
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Bread Product' : 'Add Bread Product'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
            <label className="label">Pieces per Box</label>
            <input
              type="number"
              name="piecesPerBox"
              value={formData.piecesPerBox}
              onChange={handleChange}
              className="input-field"
              placeholder="24"
              min="1"
              step="1"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Selling Price</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Per Box (₱)</label>
                <input
                  type="number"
                  name="sellingPricePerBox"
                  value={formData.sellingPricePerBox}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Per Piece (₱)</label>
                <input
                  type="number"
                  name="sellingPricePerPiece"
                  value={formData.sellingPricePerPiece}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Puhunan / Cost</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cost per Box (₱)</label>
                <input
                  type="number"
                  name="costPerBox"
                  value={formData.costPerBox}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Cost per Piece (₱)</label>
                <input
                  type="number"
                  name="costPerPiece"
                  value={formData.costPerPiece}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Inventory / Stock</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Stock Boxes</label>
                <input
                  type="number"
                  name="stockBoxes"
                  value={formData.stockBoxes}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="label">Stock Pieces</label>
                <input
                  type="number"
                  name="stockPieces"
                  value={formData.stockPieces}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
            </div>
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
