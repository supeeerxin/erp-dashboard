import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { useDrivers } from '../../context/DriverContext'
import { useRentals } from '../../context/RentalContext'

const RentalModal = ({ isOpen, onClose, onSave, rental }) => {
  const { vehicles } = useVehicles()
  const { drivers } = useDrivers()
  const { rentals } = useRentals()
  
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

  const [availableVehicles, setAvailableVehicles] = useState([])

  // Check if a vehicle is available for the selected date range
  const isVehicleAvailable = (vehicleId, startDate, endDate) => {
    if (!startDate || !endDate) return true
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    
    // Check if vehicle has any conflicting rental
    const hasConflict = rentals.some(rental => {
      if (rental.vehicle_id !== vehicleId) return false
      if (rental.is_deleted) return false
      if (rental.status === 'cancelled') return false
      
      const rentalStart = new Date(rental.start_date)
      rentalStart.setHours(0, 0, 0, 0)
      
      const rentalEnd = rental.end_date ? new Date(rental.end_date) : new Date(rental.start_date)
      rentalEnd.setHours(23, 59, 59, 999)
      
      // Check if date ranges overlap
      return start <= rentalEnd && end >= rentalStart
    })
    
    return !hasConflict
  }

  // Get available vehicles based on selected dates
  const getAvailableVehicles = () => {
    const { start_date, end_date } = formData
    if (!start_date || !end_date) return vehicles
    
    return vehicles.filter(vehicle => {
      // Only show available vehicles (not maintenance)
      if (vehicle.status === 'maintenance') return false
      return isVehicleAvailable(vehicle.id, start_date, end_date)
    })
  }

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
      // Set default dates to today and tomorrow
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData({
        vehicle_id: '',
        driver_id: '',
        driver_name: '',
        vehicle_plate: '',
        start_date: today.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        daily_boundary: '',
        down_payment: '',
        notes: ''
      })
    }
  }, [rental, isOpen])

  // Update available vehicles when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      setAvailableVehicles(getAvailableVehicles())
    } else {
      setAvailableVehicles(vehicles.filter(v => v.status !== 'maintenance'))
    }
  }, [formData.start_date, formData.end_date, vehicles, rentals])

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

    // Check if vehicle is available for the selected dates
    if (!isVehicleAvailable(formData.vehicle_id, formData.start_date, formData.end_date)) {
      alert('This vehicle is already booked for the selected dates. Please choose another vehicle or different dates.')
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
    const diffTime = Math.abs(endDate - startDate)
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    totalAmount = totalDays * (parseFloat(formData.daily_boundary) || 0)
  }

  // Get available vehicles for display
  const displayVehicles = availableVehicles.length > 0 ? availableVehicles : vehicles.filter(v => v.status !== 'maintenance')

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
            <label className="label">Vehicle *</label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleVehicleSelect}
              className="input-field"
              required
            >
              <option value="">Select Vehicle</option>
              {displayVehicles.map(vehicle => {
                const isAvail = isVehicleAvailable(vehicle.id, formData.start_date, formData.end_date)
                return (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                    {!isAvail ? ' (Booked)' : ''}
                  </option>
                )
              })}
            </select>
            {displayVehicles.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No vehicles available for the selected dates</p>
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
