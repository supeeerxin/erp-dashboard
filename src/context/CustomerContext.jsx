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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCustomers(prev => [...prev, newCustomer])
    showNotification('Customer added successfully!', 'success')
    return newCustomer
  }

  // Update customer
  const updateCustomer = (id, customerData) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id 
        ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
        : customer
    ))
    showNotification('Customer updated successfully!', 'success')
  }

  // Delete customer
  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id))
    showNotification('Customer deleted successfully!', 'success')
  }

  // Get customer by ID
  const getCustomer = (id) => {
    return customers.find(customer => customer.id === id)
  }

  // Search customers
  const searchCustomers = (query) => {
    if (!query) return customers
    const searchTerm = query.toLowerCase()
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.contact?.toLowerCase().includes(searchTerm) ||
      customer.address?.toLowerCase().includes(searchTerm)
    )
  }

  const value = {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    searchCustomers
  }

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}
