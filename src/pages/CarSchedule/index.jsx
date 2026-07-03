import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { supabase } from '../../services/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, addDays, addMonths, subMonths } from 'date-fns'

const CarSchedule = () => {
  const { vehicles, loading } = useVehicles()
  const [rentals, setRentals] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [loadingRentals, setLoadingRentals] = useState(true)

  useEffect(() => {
    const loadRentals = async () => {
      try {
        setLoadingRentals(true)
        const { data, error } = await supabase
          .from('rentals')
          .select('*')
          .eq('is_deleted', false)
          .order('start_date', { ascending: true })

        if (error) throw error
        setRentals(data || [])
      } catch (error) {
        console.error('Error loading rentals:', error)
      } finally {
        setLoadingRentals(false)
      }
    }

    loadRentals()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Check if a vehicle is rented on a specific date
  const isVehicleRentedOnDate = (vehicleId, date) => {
    return rentals.some(rental => {
      if (rental.vehicle_id !== vehicleId) return false
      const startDate = new Date(rental.start_date)
      const endDate = rental.end_date ? new Date(rental.end_date) : null
      
      if (endDate) {
        return date >= startDate && date <= endDate
      }
      return isSameDay(date, startDate)
    })
  }

  // Get available vehicles for a specific date
  const getAvailableVehiclesForDate = (date) => {
    return vehicles.filter(vehicle => {
      return !isVehicleRentedOnDate(vehicle.id, date)
    })
  }

  const handleDateClick = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return
    setSelectedDate(date)
  }

  const getDayStatus = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return 'opacity-50 cursor-not-allowed'
    const availableCount = getAvailableVehiclesForDate(date).length
    if (availableCount === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-pointer'
    if (availableCount < vehicles.length) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 cursor-pointer'
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-pointer'
  }

  const getDayIcon = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return null
    const availableCount = getAvailableVehiclesForDate(date).length
    if (availableCount === 0) return <XCircle className="w-4 h-4" />
    if (availableCount < vehicles.length) return <AlertCircle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const selectedDateVehicles = selectedDate ? getAvailableVehiclesForDate(selectedDate) : []

  if (loading || loadingRentals) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="card">
          <div className="skeleton h-12 w-full"></div>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="skeleton h-24 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Car Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View vehicle availability and rental schedules
          </p>
        </div>
        <button
          onClick={() => setSelectedDate(null)}
          className="btn-secondary text-sm"
        >
          Clear Selection
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Fully Booked</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {daysInMonth.map((date, index) => {
            const dayStatus = getDayStatus(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const isPast = isBefore(date, new Date()) && !isToday(date)
            const availableCount = getAvailableVehiclesForDate(date).length

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-20 rounded-lg p-2 transition-all hover:scale-105
                  ${isSelected ? 'ring-2 ring-primary-500' : ''}
                  ${isTodayDate ? 'border-2 border-primary-500' : ''}
                  ${dayStatus}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isTodayDate ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {!isPast && (
                    <span className="text-xs">
                      {getDayIcon(date)}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  {!isPast && (
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {availableCount} avail
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {format(selectedDate, 'MMMM dd, yyyy')}
          </h3>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Vehicles ({selectedDateVehicles.length})
            </h4>
            {selectedDateVehicles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No vehicles available on this date</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedDateVehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.plate_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-500">
                        ₱{vehicle.daily_boundary.toLocaleString()}
                      </p>
                      <span className="badge badge-success">Available</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CarSchedule
