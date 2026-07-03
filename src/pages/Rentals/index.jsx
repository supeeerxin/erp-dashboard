import React, { useState } from 'react'
import { Calendar, Plus, Search, Edit2, Trash2, Car, User, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useRentals } from '../../context/RentalContext'
import { useVehicles } from '../../context/VehicleContext'
import { useDrivers } from '../../context/DriverContext'
import RentalModal from '../../components/modals/RentalModal'

const Rentals = () => {
  const { rentals, loading, addRental, updateRentalStatus, deleteRental } = useRentals()
  const { vehicles } = useVehicles()
  const { drivers } = useDrivers()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRental, setEditingRental] = useState(null)

  const filteredRentals = rentals.filter(r =>
    r.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-warning">Active</span>
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const handleAddRental = async (data) => {
    await addRental(data)
  }

  const handleEditRental = (rental) => {
    setEditingRental(rental)
    setIsModalOpen(true)
  }

  const handleUpdateRental = async (data) => {
    // For simplicity, we'll just update status
    // In a full implementation, you'd update all fields
    await updateRentalStatus(editingRental.id, data.status || 'active')
    setEditingRental(null)
  }

  const handleDeleteRental = async (id) => {
    if (window.confirm('Delete this rental?')) {
      await deleteRental(id)
    }
  }

  const handleStatusChange = async (id, status) => {
    await updateRentalStatus(id, status)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRental(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="card">
          <div className="skeleton h-12 w-full"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full"></div>
          ))}
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
            Rentals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage vehicle rentals and assignments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Rental
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Rentals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{rentals.length}</p>
        </div>
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-yellow-600">{rentals.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="card p-4 bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600">{rentals.filter(r => r.status === 'completed').length}</p>
        </div>
        <div className="card p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{rentals.filter(r => r.status === 'cancelled').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rentals by driver, plate number, or transaction #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Rental List */}
      {filteredRentals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Car className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No rentals found' : 'No rentals yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Start by creating your first rental'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRentals.map((rental) => {
            const vehicle = vehicles.find(v => v.id === rental.vehicle_id)
            const driver = drivers.find(d => d.id === rental.driver_id)
            const totalDays = rental.total_days || 0
            const remainingBalance = rental.remaining_balance || 0

            return (
              <div key={rental.id} className="card card-hover">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {vehicle?.brand} {vehicle?.model}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {rental.vehicle_plate || vehicle?.plate_number}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {rental.driver_name || driver?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {rental.start_date} → {rental.end_date}
                      </span>
                      <span className="font-medium text-primary-500">
                        ₱{rental.daily_boundary}/day
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ₱{rental.total_amount?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: ₱{remainingBalance.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(rental.status)}
                      
                      {rental.status === 'active' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(rental.id, 'completed')}
                            className="btn-success text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(rental.id, 'cancelled')}
                            className="btn-danger text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditRental(rental)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteRental(rental.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RentalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingRental ? handleUpdateRental : handleAddRental}
        rental={editingRental}
      />
    </div>
  )
}

export default Rentals
