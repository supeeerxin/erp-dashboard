import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'

const CustomerContext = createContext()

export const useCustomers = () => {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error('useCustomers must be used within CustomerProvider')
  }
  return context
}

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  // Load customers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customers')
    if (saved) {
      setCustomers(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  // Save to localStorage whenever customers change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('customers', JSON.stringify(customers))
    }
  }, [customers, loading])

  // Add customer
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: Date.now(),
      ...customerData,
      isDeleted: false, // Soft delete flag
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCustomers(prev => [...prev, newCustomer])
    showNotification('Customer added successfully!', 'success')
    addLog('Created', 'Customer', `Added customer: ${customerData.name} (${customerData.email || 'No email'})`)
    return newCustomer
  }

  // Update customer
  const updateCustomer = (id, customerData) => {
    const customer = getCustomer(id)
    setCustomers(prev => prev.map(customer => 
      customer.id === id && !customer.isDeleted
        ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
        : customer
    ))
    showNotification('Customer updated successfully!', 'success')
    addLog('Updated', 'Customer', `Updated customer: ${customer?.name || 'Unknown'} → ${customerData.name || 'Updated'}`)
  }

  // Soft delete customer
  const deleteCustomer = (id) => {
    const customer = getCustomer(id)
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, isDeleted: true, deletedAt: new Date().toISOString() }
        : customer
    ))
    showNotification('Customer moved to trash!', 'warning')
    addLog('Deleted', 'Customer', `Soft deleted customer: ${customer?.name || 'Unknown'}`)
  }

  // Restore customer from trash
  const restoreCustomer = (id) => {
    const customer = getCustomer(id)
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, isDeleted: false, deletedAt: null }
        : customer
    ))
    showNotification('Customer restored successfully!', 'success')
    addLog('Restored', 'Customer', `Restored customer: ${customer?.name || 'Unknown'}`)
  }

  // Permanently delete customer (hard delete)
  const permanentDeleteCustomer = (id) => {
    const customer = getCustomer(id)
    setCustomers(prev => prev.filter(customer => customer.id !== id))
    showNotification('Customer permanently deleted!', 'error')
    addLog('Deleted', 'Customer', `Permanently deleted customer: ${customer?.name || 'Unknown'}`)
  }

  // Get active customers (not deleted)
  const getActiveCustomers = () => {
    return customers.filter(customer => !customer.isDeleted)
  }

  // Get deleted customers (in trash)
  const getDeletedCustomers = () => {
    return customers.filter(customer => customer.isDeleted)
  }

  // Get customer by ID (including deleted)
  const getCustomer = (id) => {
    return customers.find(customer => customer.id === id)
  }

  const value = {
    customers: getActiveCustomers(), // Only return active customers
    deletedCustomers: getDeletedCustomers(),
    allCustomers: customers, // All including deleted
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer, // Soft delete
    restoreCustomer,
    permanentDeleteCustomer,
    getCustomer,
    getActiveCustomers,
    getDeletedCustomers
  }

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}
