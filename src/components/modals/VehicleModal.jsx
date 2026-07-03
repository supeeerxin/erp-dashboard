import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const VehicleModal = ({ isOpen, onClose, onSave, vehicle }) => {
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    daily_boundary: '',
    status: 'available',
    description: ''
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate_number: vehicle.plate_number || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        daily_boundary: vehicle.daily_boundary || '',
        status: vehicle.status || 'available',
        description: vehicle.description || ''
      })
    } else {
      setFormData({
        plate_number: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        daily_boundary: '',
        status: 'available',
        description: ''
      })
    }
  }, [vehicle, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.plate_number || !formData.brand || !formData.model) {
      alert('Please fill in all required fields')
      return
    }
    onSave({
      ...formData,
      year: parseInt(formData.year) || null,
      daily_boundary: parseFloat(formData.daily_boundary) || 0
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Plate Number *</label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field"
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <label className="label">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field"
                placeholder="Vios"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                placeholder="2020"
                min="1980"
                max="2099"
              />
            </div>
            <div>
              <label className="label">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="input-field"
                placeholder="White"
              />
            </div>
          </div>

          <div>
            <label className="label">Daily Boundary (₱) *</label>
            <input
              type="number"
              name="daily_boundary"
              value={formData.daily_boundary}
              onChange={handleChange}
              className="input-field"
              placeholder="500.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
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
              {vehicle ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VehicleModal
