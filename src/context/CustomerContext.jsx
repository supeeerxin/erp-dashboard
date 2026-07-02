import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'

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

  useEffect(() => {
    const saved = localStorage.getItem('customers')
    if (saved) {
      setCustomers(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('customers', JSON.stringify(customers))
    }
  }, [customers, loading])

  const addCustomer = (customerData) => {
    const newCustomer = {
      id: Date.now(),
      ...customerData,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCustomers(prev => [...prev, newCustomer])
    showNotification('Customer added successfully!', 'success')
    return newCustomer
  }

  const updateCustomer = (id, customerData) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id && !customer.isDeleted
        ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
        : customer
    ))
    showNotification('Customer updated successfully!', 'success')
  }

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, isDeleted: true, deletedAt: new Date().toISOString() }
        : customer
    ))
    showNotification('Customer moved to trash!', 'warning')
  }

  const restoreCustomer = (id) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, isDeleted: false, deletedAt: null }
        : customer
    ))
    showNotification('Customer restored successfully!', 'success')
  }

  const permanentDeleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id))
    showNotification('Customer permanently deleted!', 'error')
  }

  const getActiveCustomers = () => {
    return customers.filter(customer => !customer.isDeleted)
  }

  const getDeletedCustomers = () => {
    return customers.filter(customer => customer.isDeleted)
  }

  const getCustomer = (id) => {
    return customers.find(customer => customer.id === id)
  }

  const value = {
    customers: getActiveCustomers(),
    deletedCustomers: getDeletedCustomers(),
    allCustomers: customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
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
