import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Car, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { supabase } from '../../services/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfWeek, endOfWeek, addDays, addMonths, subMonths } from 'date-fns'

const CarSchedule = () => {
  const { vehicles, loading } = useVehicles()
  const [rentals, setRentals] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loadingRentals, setLoadingRentals] = useState(true)

  // Load rentals from Supabase
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

  // Get days in current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get start of week for the first day
  const startOfWeekDate = startOfWeek(monthStart, { weekStartsOn: 0 })

  // Get all days including padding from previous/next month
  const calendarDays = []
  let day = startOfWeekDate
  while (day <= endOfMonth(monthEnd)) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  // Check if a vehicle is rented on a specific date
  const isVehicleRentedOnDate = (vehicleId, date) => {
    return rentals.some(rental => {
      if (rental.vehicle_id !== vehicleId) return false
      const startDate = new Date(rental.start_date)
      const endDate = rental.end_date ? new Date(rental.end_date) : null
      
      // Check if date is within rental period
      if (endDate) {
        return date >= startDate && date <= endDate
      }
      return isSameDay(date, startDate)
    })
  }

  // Get rental details for a vehicle on a specific date
  const getRentalForDate = (vehicleId, date) => {
    return rentals.find(rental => {
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

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date)
    setSelectedVehicle(null)
  }

  // Handle vehicle selection in detail view
  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId)
  }

  // Get day status color
  const getDayStatus = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return 'opacity-50'
    const availableCount = getAvailableVehiclesForDate(date).length
    if (availableCount === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    if (availableCount < vehicles.length) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  }

  // Get day status icon
  const getDayIcon = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return null
    const availableCount = getAvailableVehiclesForDate(date).length
    if (availableCount === 0) return <XCircle className="w-4 h-4" />
    if (availableCount < vehicles.length) return <AlertCircle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  // Get day status text
  const getDayStatusText = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return 'Past date'
    const availableCount = getAvailableVehiclesForDate(date).length
    if (availableCount === 0) return 'Fully Booked'
    if (availableCount < vehicles.length) return `${availableCount} cars available`
    return 'All cars available'
  }

  // Navigate months
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // Selected date details
  const selectedDateVehicles = selectedDate ? getAvailableVehiclesForDate(selectedDate) : []
  const selectedDateRentals = selectedDate ? rentals.filter(r => {
    const startDate = new Date(r.start_date)
    const endDate = r.end_date ? new Date(r.end_date) : null
    if (endDate) {
      return selectedDate >= startDate && selectedDate <= endDate
    }
    return isSameDay(selectedDate, startDate)
  }) : []

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(null)}
            className="btn-secondary text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Limited Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>
          <span className="text-gray-600 dark:text-gray-400">Fully Booked</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month Navigation */}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            const dayStatus = getDayStatus(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const isPast = isBefore(date, new Date()) && !isToday(date)
            const availableCount = getAvailableVehiclesForDate(date).length

            return (
              <div
                key={index}
                onClick={() => !isPast && handleDateClick(date)}
                className={`
                  min-h-24 rounded-lg p-2 cursor-pointer transition-all hover:scale-105
                  ${isSelected ? 'ring-2 ring-primary-500' : ''}
                  ${isTodayDate ? 'border-2 border-primary-500' : ''}
                  ${isPast ? 'opacity-40 cursor-not-allowed' : dayStatus}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available Vehicles */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Vehicles ({selectedDateVehicles.length})
              </h4>
              {selectedDateVehicles.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No vehicles available on this date</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateVehicles.map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.plate_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-500">
                          ₱{vehicle.daily_boundary.toLocaleString()}/day
                        </p>
                        <span className="badge badge-success">Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booked/Rented Vehicles */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Booked/Rented ({selectedDateRentals.length})
              </h4>
              {selectedDateRentals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No bookings on this date</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateRentals.map(rental => {
                    const vehicle = vehicles.find(v => v.id === rental.vehicle_id)
                    return (
                      <div key={rental.id} className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {vehicle?.brand} {vehicle?.model}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Driver: {rental.driver_name}
                            </p>
                          </div>
                          <span className="badge badge-danger">Rented</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(rental.start_date), 'MMM dd')} 
                          {rental.end_date && ` - ${format(new Date(rental.end_date), 'MMM dd')}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarSchedule
