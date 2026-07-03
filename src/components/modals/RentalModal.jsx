import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { useDrivers } from '../../context/DriverContext'

const RentalModal = ({ isOpen, onClose, onSave, rental }) => {
  const { vehicles } = useVehicles()
  const { drivers } = useDrivers()
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    driver_name: '',
    vehicle_plate: '',
    start_date: '',
    end_date: '',
    daily_boundary: '',
    down_payment: '',
    notes: ''
  })

  useEffect(() => {
    if (rental) {
      setFormData({
        vehicle_id: rental.vehicle_id || '',
        driver_id: rental.driver_id || '',
        driver_name: rental.driver_name || '',
        vehicle_plate: rental.vehicle_plate || '',
        start_date: rental.start_date || '',
        end_date: rental.end_date || '',
        daily_boundary: rental.daily_boundary || '',
        down_payment: rental.down_payment || '',
        notes: rental.notes || ''
      })
    } else {
      setFormData({
        vehicle_id: '',
        driver_id: '',
        driver_name: '',
        vehicle_plate: '',
        start_date: '',
        end_date: '',
        daily_boundary: '',
        down_payment: '',
        notes: ''
      })
    }
  }, [rental, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVehicleSelect = (e) => {
    const vehicleId = parseInt(e.target.value)
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicle_id: vehicleId,
        vehicle_plate: vehicle.plate_number || '',
        daily_boundary: vehicle.daily_boundary || ''
      }))
    }
  }

  const handleDriverSelect = (e) => {
    const driverId = parseInt(e.target.value)
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      setFormData(prev => ({
        ...prev,
        driver_id: driverId,
        driver_name: driver.name || ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.vehicle_id || !formData.driver_id || !formData.start_date || !formData.end_date) {
      alert('Please fill in all required fields')
      return
    }
    onSave({
      ...formData,
      daily_boundary: parseFloat(formData.daily_boundary) || 0,
      down_payment: parseFloat(formData.down_payment) || 0,
      vehicle_id: parseInt(formData.vehicle_id),
      driver_id: parseInt(formData.driver_id)
    })
    onClose()
  }

  if (!isOpen) return null

  const startDate = formData.start_date ? new Date(formData.start_date) : null
  const endDate = formData.end_date ? new Date(formData.end_date) : null
  let totalDays = 0
  let totalAmount = 0

  if (startDate && endDate) {
    totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    totalAmount = totalDays * (parseFloat(formData.daily_boundary) || 0)
  }

  const availableVehicles = vehicles.filter(v => v.status === 'available')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {rental ? 'Edit Rental' : 'New Rental'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Vehicle *</label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleVehicleSelect}
              className="input-field"
              required
            >
              <option value="">Select Vehicle</option>
              {availableVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No available vehicles. Please add a vehicle first.</p>
            )}
          </div>

          <div>
            <label className="label">Driver *</label>
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleDriverSelect}
              className="input-field"
              required
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.contact || 'No contact'}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No drivers available. Please add a driver first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="input-field"
                required
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
            <label className="label">Down Payment (₱)</label>
            <input
              type="number"
              name="down_payment"
              value={formData.down_payment}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          {totalDays > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Days: <span className="font-medium text-gray-900 dark:text-white">{totalDays} days</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Amount: <span className="font-bold text-primary-500">₱{totalAmount.toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remaining: <span className="font-medium text-gray-900 dark:text-white">
                  ₱{(totalAmount - (parseFloat(formData.down_payment) || 0)).toFixed(2)}
                </span>
              </p>
            </div>
          )}

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
              {rental ? 'Update' : 'Create'} Rental
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RentalModal
