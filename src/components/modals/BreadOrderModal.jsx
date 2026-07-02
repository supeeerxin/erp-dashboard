import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'
import { useBreadProducts } from '../../context/BreadProductContext'

const BreadOrderModal = ({ isOpen, onClose, onSave, order }) => {
  const { customers } = useCustomers()
  const { products } = useBreadProducts()
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    productId: '',
    productName: '',
    boxes: '',
    pieces: '',
    status: 'pending',
    deliveryDate: '',
    notes: ''
  })

  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (order) {
      const product = products.find(p => p.id === order.productId)
      setSelectedProduct(product || null)
      setFormData({
        customerId: order.customerId || '',
        customerName: order.customerName || '',
        productId: order.productId || '',
        productName: order.productName || '',
        boxes: order.boxes || '',
        pieces: order.pieces || '',
        status: order.status || 'pending',
        deliveryDate: order.deliveryDate || '',
        notes: order.notes || ''
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        customerId: '',
        customerName: '',
        productId: '',
        productName: '',
        boxes: '',
        pieces: '',
        status: 'pending',
        deliveryDate: '',
        notes: ''
      })
    }
  }, [order, isOpen, products])

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

  const handleProductSelect = (e) => {
    const productId = e.target.value
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setSelectedProduct(product)
      setFormData(prev => ({
        ...prev,
        productId: productId,
        productName: product.name
      }))
    } else {
      setSelectedProduct(null)
      setFormData(prev => ({
        ...prev,
        productId: '',
        productName: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.customerId || !formData.productId) {
      alert('Please select a customer and product')
      return
    }
    if (!formData.boxes && !formData.pieces) {
      alert('Please enter at least 1 box or piece')
      return
    }

    if (!selectedProduct) {
      alert('Please select a valid product')
      return
    }

    const boxes = parseInt(formData.boxes) || 0
    const pieces = parseInt(formData.pieces) || 0
    const totalAmount = (boxes * (selectedProduct.sellingPricePerBox || 0)) + (pieces * (selectedProduct.sellingPricePerPiece || 0))

    onSave({
      ...formData,
      boxes: boxes,
      pieces: pieces,
      productName: selectedProduct.name,
      sellingPricePerBox: selectedProduct.sellingPricePerBox || 0,
      sellingPricePerPiece: selectedProduct.sellingPricePerPiece || 0,
      costPerBox: selectedProduct.costPerBox || 0,
      costPerPiece: selectedProduct.costPerPiece || 0,
      productId: parseInt(formData.productId),
      totalAmount: totalAmount
    })
    onClose()
  }

  if (!isOpen) return null

  const boxes = parseInt(formData.boxes) || 0
  const pieces = parseInt(formData.pieces) || 0
  const sellingPricePerBox = selectedProduct?.sellingPricePerBox || 0
  const sellingPricePerPiece = selectedProduct?.sellingPricePerPiece || 0
  const costPerBox = selectedProduct?.costPerBox || 0
  const costPerPiece = selectedProduct?.costPerPiece || 0
  
  const totalSelling = (boxes * sellingPricePerBox) + (pieces * sellingPricePerPiece)
  const totalCost = (boxes * costPerBox) + (pieces * costPerPiece)
  const profit = totalSelling - totalCost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {order ? 'Edit Bread Order' : 'New Bread Order'}
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
            <label className="label">Bread Product *</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleProductSelect}
              className="input-field"
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} 
                  {product.stockBoxes !== undefined && (
                    <span className="text-gray-400 text-xs ml-1">
                      (Stock: {product.stockBoxes || 0} boxes)
                    </span>
                  )}
                </option>
              ))}
            </select>
            
            {selectedProduct && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs space-y-1">
                <p className="text-gray-600 dark:text-gray-400">
                  Selling: <span className="font-medium text-primary-500">₱{selectedProduct.sellingPricePerBox?.toFixed(2) || 0}/box</span>
                  <span className="text-gray-400 ml-1">({selectedProduct.piecesPerBox || 24} pcs)</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Per Piece: <span className="font-medium text-primary-500">₱{selectedProduct.sellingPricePerPiece?.toFixed(2) || 0}</span>
                </p>
                <p className={`text-gray-600 dark:text-gray-400 ${(selectedProduct.stockBoxes || 0) <= 5 ? 'text-red-500' : ''}`}>
                  Available: {selectedProduct.stockBoxes || 0} boxes | {selectedProduct.stockPieces || 0} pieces
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Boxes</label>
              <input
                type="number"
                name="boxes"
                value={formData.boxes}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="label">Pieces</label>
              <input
                type="number"
                name="pieces"
                value={formData.pieces}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Total Amount Payable - prominently displayed */}
          {selectedProduct && (boxes > 0 || pieces > 0) && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount Payable</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ₱{totalSelling.toFixed(2)}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{boxes} boxes × ₱{sellingPricePerBox.toFixed(2)} = ₱{(boxes * sellingPricePerBox).toFixed(2)}</p>
                {pieces > 0 && (
                  <p>{pieces} pieces × ₱{sellingPricePerPiece.toFixed(2)} = ₱{(pieces * sellingPricePerPiece).toFixed(2)}</p>
                )}
              </div>
            </div>
          )}

          {/* Profit/Cost breakdown - optional */}
          {selectedProduct && (boxes > 0 || pieces > 0) && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                Cost: <span className="font-medium text-gray-900 dark:text-white">₱{totalCost.toFixed(2)}</span>
              </p>
              <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Profit: ₱{profit.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="pending">Pending (Reserved)</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed (Paid)</option>
            </select>
          </div>

          <div>
            <label className="label">Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
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
              {order ? 'Update' : 'Create'} Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BreadOrderModal
