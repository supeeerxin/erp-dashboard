import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const DriverModal = ({ isOpen, onClose, onSave, driver }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    license_number: '',
    address: ''
  })

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        contact: driver.contact || '',
        license_number: driver.license_number || '',
        address: driver.address || ''
      })
    } else {
      setFormData({
        name: '',
        contact: '',
        license_number: '',
        address: ''
      })
    }
  }, [driver, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please enter driver name')
      return
    }
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {driver ? 'Edit Driver' : 'Add Driver'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Driver Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div>
            <label className="label">Contact Number</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="input-field"
              placeholder="09123456789"
            />
          </div>

          <div>
            <label className="label">License Number</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              className="input-field"
              placeholder="License #"
            />
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="Address..."
              rows="2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {driver ? 'Update' : 'Add'} Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DriverModal
