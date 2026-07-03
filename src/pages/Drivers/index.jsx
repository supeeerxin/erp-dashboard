import React, { useState } from 'react'
import { User, Plus, Search, Edit2, Trash2, Phone, MapPin, FileText } from 'lucide-react'
import { useDrivers } from '../../context/DriverContext'
import DriverModal from '../../components/modals/DriverModal'

const Drivers = () => {
  const { drivers, loading, addDriver, updateDriver, deleteDriver } = useDrivers()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.license_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddDriver = async (data) => {
    await addDriver(data)
  }

  const handleEditDriver = (driver) => {
    setEditingDriver(driver)
    setIsModalOpen(true)
  }

  const handleUpdateDriver = async (data) => {
    await updateDriver(editingDriver.id, data)
    setEditingDriver(null)
  }

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Delete this driver?')) {
      await deleteDriver(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDriver(null)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-primary-500" />
            Drivers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your drivers
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <User className="empty-state-icon" />
            <p className="empty-state-text">No drivers found</p>
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
                  <button onClick={() => handleEditDriver(driver)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDeleteDriver(driver.id)} className="p-1.5 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
