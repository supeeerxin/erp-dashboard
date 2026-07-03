import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { supabase } from '../services/supabase'

const VehicleContext = createContext()

export const useVehicles = () => {
  const context = useContext(VehicleContext)
  if (!context) {
    throw new Error('useVehicles must be used within VehicleProvider')
  }
  return context
}

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
      showNotification('Failed to load vehicles', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const addVehicle = async (data) => {
    try {
      const newVehicle = {
        id: Date.now(),
        plate_number: data.plate_number,
        brand: data.brand,
        model: data.model,
        year: data.year || null,
        color: data.color || '',
        daily_boundary: data.daily_boundary || 0,
        status: 'available',
        description: data.description || '',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: inserted, error } = await supabase
        .from('vehicles')
        .insert([newVehicle])
        .select()

      if (error) throw error

      setVehicles(prev => [inserted[0], ...prev])
      showNotification('Vehicle added successfully!', 'success')
      return inserted[0]
    } catch (error) {
      console.error('Error adding vehicle:', error)
      showNotification('Failed to add vehicle', 'error')
      return null
    }
  }

  const updateVehicle = async (id, data) => {
    try {
      const { data: updated, error } = await supabase
        .from('vehicles')
        .update({
          plate_number: data.plate_number,
          brand: data.brand,
          model: data.model,
          year: data.year || null,
          color: data.color || '',
          daily_boundary: data.daily_boundary || 0,
          description: data.description || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setVehicles(prev => prev.map(v => v.id === id ? updated[0] : v))
      showNotification('Vehicle updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating vehicle:', error)
      showNotification('Failed to update vehicle', 'error')
    }
  }

  const deleteVehicle = async (id) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setVehicles(prev => prev.filter(v => v.id !== id))
      showNotification('Vehicle moved to trash!', 'warning')
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      showNotification('Failed to delete vehicle', 'error')
    }
  }

  const updateVehicleStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setVehicles(prev => prev.map(v => 
        v.id === id ? { ...v, status } : v
      ))
    } catch (error) {
      console.error('Error updating vehicle status:', error)
    }
  }

  const getVehicle = (id) => {
    return vehicles.find(v => v.id === id)
  }

  const getAvailableVehicles = () => {
    return vehicles.filter(v => v.status === 'available')
  }

  const value = {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    getVehicle,
    getAvailableVehicles,
    refreshVehicles: loadVehicles
  }

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  )
}
