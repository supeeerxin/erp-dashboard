import React, { useState } from 'react'
import { Car, Plus, Search, Edit2, Trash2, Eye, Calendar, DollarSign } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import VehicleModal from '../../components/modals/VehicleModal'

const Vehicles = () => {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  const filteredVehicles = vehicles.filter(v =>
    v.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleAddVehicle = async (data) => {
    await addVehicle(data)
  }

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleUpdateVehicle = async (data) => {
    await updateVehicle(editingVehicle.id, data)
    setEditingVehicle(null)
  }

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Move this vehicle to trash?')) {
      await deleteVehicle(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVehicle(null)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-4 w-32 mt-2"></div>
              <div className="skeleton h-4 w-24 mt-2"></div>
            </div>
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
            <Car className="w-6 h-6 text-primary-500" />
            Vehicles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your fleet of vehicles
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
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

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles by plate number, brand, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Vehicle List */}
      {filteredVehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Car className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No vehicles found' : 'No vehicles yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Start by adding your first vehicle'
              }
            </p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vehicle.plate_number}
                  </p>
                  {vehicle.year && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {vehicle.year} · {vehicle.color || 'N/A'}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Boundary</span>
                  <span className="text-sm font-bold text-primary-500">
                    ₱{vehicle.daily_boundary?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
        vehicle={editingVehicle}
      />
    </div>
  )
}

export default Vehicles
