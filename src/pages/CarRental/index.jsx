import React, { useState } from 'react'
import { Car, User, Calendar, LayoutDashboard, Plus, Search, Edit2, Trash2, Phone, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { useDrivers } from '../../context/DriverContext'
import { useRentals } from '../../context/RentalContext'
import VehicleModal from '../../components/modals/VehicleModal'
import DriverModal from '../../components/modals/DriverModal'
import RentalModal from '../../components/modals/RentalModal'

const CarRental = () => {
  const [activeTab, setActiveTab] = useState('vehicles')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false)
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [editingDriver, setEditingDriver] = useState(null)
  const [editingRental, setEditingRental] = useState(null)

  // Contexts
  const { vehicles, loading: vehiclesLoading, addVehicle, updateVehicle, deleteVehicle } = useVehicles()
  const { drivers, loading: driversLoading, addDriver, updateDriver, deleteDriver } = useDrivers()
  const { rentals, loading: rentalsLoading, addRental, updateRentalStatus, deleteRental } = useRentals()

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="badge badge-success">Available</span>
      case 'rented':
        return <span className="badge badge-warning">Rented</span>
      case 'maintenance':
        return <span className="badge badge-danger">Maintenance</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const getRentalStatusBadge = (status) => {
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

  // Filter functions
  const filteredVehicles = vehicles.filter(v =>
    v.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRentals = rentals.filter(r =>
    r.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handlers
  const handleAddVehicle = async (data) => {
    await addVehicle(data)
    setIsVehicleModalOpen(false)
  }

  const handleUpdateVehicle = async (data) => {
    await updateVehicle(editingVehicle.id, data)
    setEditingVehicle(null)
    setIsVehicleModalOpen(false)
  }

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      await deleteVehicle(id)
    }
  }

  const handleAddDriver = async (data) => {
    await addDriver(data)
    setIsDriverModalOpen(false)
  }

  const handleUpdateDriver = async (data) => {
    await updateDriver(editingDriver.id, data)
    setEditingDriver(null)
    setIsDriverModalOpen(false)
  }

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Delete this driver?')) {
      await deleteDriver(id)
    }
  }

  const handleAddRental = async (data) => {
    await addRental(data)
    setIsRentalModalOpen(false)
  }

  const handleUpdateRental = async (data) => {
    await updateRentalStatus(editingRental.id, data.status || 'active')
    setEditingRental(null)
    setIsRentalModalOpen(false)
  }

  const handleDeleteRental = async (id) => {
    if (window.confirm('Delete this rental?')) {
      await deleteRental(id)
    }
  }

  const handleRentalStatusChange = async (id, status) => {
    await updateRentalStatus(id, status)
  }

  const tabs = [
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
    { id: 'drivers', label: 'Drivers', icon: User, count: drivers.length },
    { id: 'rentals', label: 'Rentals', icon: Calendar, count: rentals.length },
    { id: 'schedule', label: 'Schedule', icon: LayoutDashboard, count: 0 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicles.length}</p>
              </div>
              <div className="card p-4 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'available').length}</p>
              </div>
              <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rented</p>
                <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'rented').length}</p>
              </div>
              <div className="card p-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-red-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              </div>
            </div>

            {/* Vehicle List */}
            {filteredVehicles.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <Car className="empty-state-icon" />
                  <p className="empty-state-text">No vehicles found</p>
                  <button onClick={() => setIsVehicleModalOpen(true)} className="btn-primary mt-4">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Vehicle
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="card card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.plate_number}</p>
                        {vehicle.year && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.year} · {vehicle.color || 'N/A'}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setIsVehicleModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Daily Boundary</span>
                      <span className="text-sm font-bold text-primary-500">₱{vehicle.daily_boundary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'drivers':
        return (
          <div>
            <div className="card mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{drivers.length}</p>
            </div>

            {filteredDrivers.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <User className="empty-state-icon" />
                  <p className="empty-state-text">No drivers found</p>
                  <button onClick={() => setIsDriverModalOpen(true)} className="btn-primary mt-4">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Driver
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                  <div key={driver.id} className="card card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{driver.name}</h3>
                        {driver.contact && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {driver.contact}
                          </p>
                        )}
                        {driver.license_number && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> License: {driver.license_number}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingDriver(driver)
                            setIsDriverModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'rentals':
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rentals.length}</p>
              </div>
              <div className="card p-4 bg-yellow-50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{rentals.filter(r => r.status === 'active').length}</p>
              </div>
              <div className="card p-4 bg-green-50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{rentals.filter(r => r.status === 'completed').length}</p>
              </div>
              <div className="card p-4 bg-red-50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{rentals.filter(r => r.status === 'cancelled').length}</p>
              </div>
            </div>

            {filteredRentals.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <Calendar className="empty-state-icon" />
                  <p className="empty-state-text">No rentals found</p>
                  <button onClick={() => setIsRentalModalOpen(true)} className="btn-primary mt-4">
                    <Plus className="w-4 h-4 inline mr-2" /> New Rental
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRentals.map((rental) => {
                  const vehicle = vehicles.find(v => v.id === rental.vehicle_id)
                  return (
                    <div key={rental.id} className="card">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-primary-500" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {vehicle?.brand} {vehicle?.model} - {rental.vehicle_plate}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Driver: {rental.driver_name}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {rental.start_date} → {rental.end_date}
                            </span>
                            <span className="font-medium text-primary-500">
                              ₱{rental.daily_boundary}/day
                            </span>
                            <span className="font-medium">
                              Total: ₱{rental.total_amount?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRentalStatusBadge(rental.status)}
                          {rental.status === 'active' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRentalStatusChange(rental.id, 'completed')}
                                className="btn-success text-xs px-2 py-1 rounded-lg"
                              >
                                <CheckCircle className="w-3 h-3 inline mr-1" /> Done
                              </button>
                              <button
                                onClick={() => handleRentalStatusChange(rental.id, 'cancelled')}
                                className="btn-danger text-xs px-2 py-1 rounded-lg"
                              >
                                <XCircle className="w-3 h-3 inline mr-1" /> Cancel
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteRental(rental.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'schedule':
        return (
          <div className="card">
            <div className="empty-state">
              <LayoutDashboard className="empty-state-icon" />
              <p className="empty-state-text">Schedule View</p>
              <p className="empty-state-subtext">
                Go to Car Schedule page for full calendar view
              </p>
              <button
                onClick={() => window.location.href = '/car-schedule'}
                className="btn-primary mt-4"
              >
                View Full Schedule
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Loading states
  if (vehiclesLoading || driversLoading || rentalsLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-32"></div>
          ))}
        </div>
        <div className="card">
          <div className="skeleton h-64 w-full"></div>
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
            <Car className="w-6 h-6 text-primary-500" />
            Car Rental Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage vehicles, drivers, and rentals in one place
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'vehicles' && (
            <button onClick={() => setIsVehicleModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          )}
          {activeTab === 'drivers' && (
            <button onClick={() => setIsDriverModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          )}
          {activeTab === 'rentals' && (
            <button onClick={() => setIsRentalModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Rental
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                ${isActive 
                  ? 'text-primary-500 border-b-2 border-primary-500' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${isActive ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}
              `}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      {activeTab !== 'schedule' && (
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false)
          setEditingVehicle(null)
        }}
        onSave={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
        vehicle={editingVehicle}
      />

      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false)
          setEditingDriver(null)
        }}
        onSave={editingDriver ? handleUpdateDriver : handleAddDriver}
        driver={editingDriver}
      />

      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false)
          setEditingRental(null)
        }}
        onSave={editingRental ? handleUpdateRental : handleAddRental}
        rental={editingRental}
      />
    </div>
  )
}

export default CarRental
