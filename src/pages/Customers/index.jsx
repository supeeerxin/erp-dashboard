import React, { useState } from 'react'
import { Users, Plus, Search, Edit2, Trash2, User, Phone, Mail, MapPin, RotateCcw, Archive } from 'lucide-react'
import { useCustomers } from '../../context/CustomerContext'
import CustomerModal from '../../components/modals/CustomerModal'

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer, restoreCustomer, permanentDeleteCustomer } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [deletedCustomers, setDeletedCustomers] = useState([])

  // Load deleted customers
  const loadDeletedCustomers = async () => {
    const result = await useCustomers().getDeletedCustomers()
    setDeletedCustomers(result)
  }

  const filteredCustomers = (showTrash ? deletedCustomers : customers).filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddCustomer = async (data) => {
    await addCustomer(data)
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleUpdateCustomer = async (data) => {
    await updateCustomer(editingCustomer.id, data)
    setEditingCustomer(null)
  }

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Move this customer to trash?')) {
      await deleteCustomer(id)
      if (showTrash) {
        loadDeletedCustomers()
      }
    }
  }

  const handleRestoreCustomer = async (id) => {
    await restoreCustomer(id)
    loadDeletedCustomers()
  }

  const handlePermanentDelete = async (id) => {
    if (window.confirm('Permanently delete this customer? This cannot be undone!')) {
      await permanentDeleteCustomer(id)
      loadDeletedCustomers()
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const toggleTrash = () => {
    setShowTrash(!showTrash)
    if (!showTrash) {
      loadDeletedCustomers()
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer profiles and information
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTrash}
            className={`btn-secondary flex items-center gap-2 ${showTrash ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showTrash ? 'Active' : 'Trash'}
          </button>
          {!showTrash && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">In Trash</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{deletedCustomers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length + deletedCustomers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={showTrash ? "Search trash..." : "Search customers..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <p className="empty-state-text">
              {searchQuery ? 'No customers found' : showTrash ? 'Trash is empty' : 'No customers yet'}
            </p>
            <p className="empty-state-subtext">
              {searchQuery 
                ? 'Try adjusting your search' 
                : showTrash ? 'Deleted customers will appear here' : 'Start by adding your first customer'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {customer.name}
                    </h3>
                    <span className={`badge ${
                      customer.type === 'vip' ? 'badge-success' :
                      customer.type === 'wholesale' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {customer.type || 'Regular'}
                    </span>
                    {customer.is_deleted && (
                      <span className="badge badge-danger ml-1">Deleted</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {customer.is_deleted ? (
                    <>
                      <button
                        onClick={() => handleRestoreCustomer(customer.id)}
                        className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(customer.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {customer.contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{customer.contact}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {customer.is_deleted ? 
                    `Deleted: ${new Date(customer.deleted_at).toLocaleDateString()}` :
                    `Added: ${new Date(customer.created_at).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
        customer={editingCustomer}
      />
    </div>
  )
}

export default Customers
