import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'

const DriverContext = createContext()

export const useDrivers = () => {
  const context = useContext(DriverContext)
  if (!context) {
    throw new Error('useDrivers must be used within DriverProvider')
  }
  return context
}

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()
  const { addLog } = useAudit()

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error loading drivers:', error)
      showNotification('Failed to load drivers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  const addDriver = async (data) => {
    try {
      const newDriver = {
        id: Date.now(),
        name: data.name,
        contact: data.contact || '',
        license_number: data.license_number || '',
        address: data.address || '',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: inserted, error } = await supabase
        .from('drivers')
        .insert([newDriver])
        .select()

      if (error) throw error

      setDrivers(prev => [inserted[0], ...prev])
      showNotification('Driver added successfully!', 'success')
      addLog('Created', 'Driver', `Added driver: ${data.name}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding driver:', error)
      showNotification('Failed to add driver', 'error')
      return null
    }
  }

  const updateDriver = async (id, data) => {
    try {
      const oldDriver = drivers.find(d => d.id === id)
      const { data: updated, error } = await supabase
        .from('drivers')
        .update({
          name: data.name,
          contact: data.contact || '',
          license_number: data.license_number || '',
          address: data.address || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setDrivers(prev => prev.map(d => d.id === id ? updated[0] : d))
      showNotification('Driver updated successfully!', 'success')
      addLog('Updated', 'Driver', `Updated driver: ${oldDriver?.name || 'Unknown'} → ${data.name}`)
    } catch (error) {
      console.error('Error updating driver:', error)
      showNotification('Failed to update driver', 'error')
    }
  }

  const deleteDriver = async (id) => {
    try {
      const driver = drivers.find(d => d.id === id)
      const { error } = await supabase
        .from('drivers')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setDrivers(prev => prev.filter(d => d.id !== id))
      showNotification('Driver moved to trash!', 'warning')
      addLog('Deleted', 'Driver', `Soft deleted driver: ${driver?.name || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting driver:', error)
      showNotification('Failed to delete driver', 'error')
    }
  }

  const getDriver = (id) => {
    return drivers.find(d => d.id === id)
  }

  const value = {
    drivers,
    loading,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriver,
    refreshDrivers: loadDrivers
  }

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  )
}
