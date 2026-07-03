import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { supabase } from '../services/supabase'

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

  // Load customers from Supabase
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      showNotification('Failed to load customers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  // Add customer
  const addCustomer = async (customerData) => {
    try {
      const newCustomer = {
        id: Date.now(),
        name: customerData.name,
        contact: customerData.contact || '',
        email: customerData.email || '',
        address: customerData.address || '',
        type: customerData.type || 'regular',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()

      if (error) throw error

      setCustomers(prev => [data[0], ...prev])
      showNotification('Customer added successfully!', 'success')
      return data[0]
    } catch (error) {
      console.error('Error adding customer:', error)
      showNotification('Failed to add customer', 'error')
      return null
    }
  }

  // Update customer
  const updateCustomer = async (id, customerData) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          contact: customerData.contact || '',
          email: customerData.email || '',
          address: customerData.address || '',
          type: customerData.type || 'regular',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setCustomers(prev => prev.map(customer =>
        customer.id === id ? data[0] : customer
      ))
      showNotification('Customer updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating customer:', error)
      showNotification('Failed to update customer', 'error')
    }
  }

  // Soft delete customer
  const deleteCustomer = async (id) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setCustomers(prev => prev.filter(customer => customer.id !== id))
      showNotification('Customer moved to trash!', 'warning')
    } catch (error) {
      console.error('Error deleting customer:', error)
      showNotification('Failed to delete customer', 'error')
    }
  }

  // Restore customer
  const restoreCustomer = async (id) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)

      if (error) throw error

      await loadCustomers()
      showNotification('Customer restored successfully!', 'success')
    } catch (error) {
      console.error('Error restoring customer:', error)
      showNotification('Failed to restore customer', 'error')
    }
  }

  // Permanently delete customer
  const permanentDeleteCustomer = async (id) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCustomers(prev => prev.filter(customer => customer.id !== id))
      showNotification('Customer permanently deleted!', 'error')
    } catch (error) {
      console.error('Error permanently deleting customer:', error)
      showNotification('Failed to permanently delete customer', 'error')
    }
  }

  // Get customer by ID
  const getCustomer = (id) => {
    return customers.find(customer => customer.id === id)
  }

  // Get deleted customers
  const getDeletedCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading deleted customers:', error)
      return []
    }
  }

  const value = {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    permanentDeleteCustomer,
    getCustomer,
    getDeletedCustomers,
    refreshCustomers: loadCustomers
  }

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}
