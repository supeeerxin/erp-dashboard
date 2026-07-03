import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { supabase } from '../services/supabase'

const RentalContext = createContext()

export const useRentals = () => {
  const context = useContext(RentalContext)
  if (!context) {
    throw new Error('useRentals must be used within RentalProvider')
  }
  return context
}

export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  const loadRentals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRentals(data || [])
    } catch (error) {
      console.error('Error loading rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRentals()
  }, [])

  const addRental = async (data) => {
    try {
      console.log('Adding rental with data:', data)

      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      const totalAmount = totalDays * (data.daily_boundary || 0)
      const downPayment = data.down_payment || 0
      const remainingBalance = totalAmount - downPayment

      const newRental = {
        id: Date.now(),
        transaction_number: `RENT-${Date.now().toString().slice(-8)}`,
        vehicle_id: data.vehicle_id,
        driver_id: data.driver_id,
        driver_name: data.driver_name || '',
        vehicle_plate: data.vehicle_plate || '',
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: totalDays,
        daily_boundary: data.daily_boundary || 0,
        total_amount: totalAmount,
        down_payment: downPayment,
        remaining_balance: remainingBalance,
        status: 'active',
        notes: data.notes || '',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Inserting rental:', newRental)

      const { data: inserted, error } = await supabase
        .from('rentals')
        .insert([newRental])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        showNotification('Failed to create rental: ' + error.message, 'error')
        return null
      }

      // Update vehicle status to rented
      await supabase
        .from('vehicles')
        .update({ status: 'rented', updated_at: new Date().toISOString() })
        .eq('id', data.vehicle_id)

      setRentals(prev => [inserted[0], ...prev])
      showNotification(`Rental ${newRental.transaction_number} created!`, 'success')
      return inserted[0]
    } catch (error) {
      console.error('Error adding rental:', error)
      showNotification('Failed to create rental', 'error')
      return null
    }
  }

  const updateRentalStatus = async (id, status) => {
    try {
      const rental = rentals.find(r => r.id === id)
      
      const { error } = await supabase
        .from('rentals')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      if (status === 'completed' || status === 'cancelled') {
        await supabase
          .from('vehicles')
          .update({ status: 'available', updated_at: new Date().toISOString() })
          .eq('id', rental?.vehicle_id)
      }

      setRentals(prev => prev.map(r => 
        r.id === id ? { ...r, status } : r
      ))
      showNotification(`Rental ${status === 'completed' ? 'completed' : 'cancelled'}!`, 'success')
    } catch (error) {
      console.error('Error updating rental status:', error)
      showNotification('Failed to update rental status', 'error')
    }
  }

  const deleteRental = async (id) => {
    try {
      const rental = rentals.find(r => r.id === id)
      
      const { error } = await supabase
        .from('rentals')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      await supabase
        .from('vehicles')
        .update({ status: 'available', updated_at: new Date().toISOString() })
        .eq('id', rental?.vehicle_id)

      setRentals(prev => prev.filter(r => r.id !== id))
      showNotification('Rental deleted!', 'warning')
    } catch (error) {
      console.error('Error deleting rental:', error)
      showNotification('Failed to delete rental', 'error')
    }
  }

  const getRental = (id) => {
    return rentals.find(r => r.id === id)
  }

  const value = {
    rentals,
    loading,
    addRental,
    updateRentalStatus,
    deleteRental,
    getRental,
    refreshRentals: loadRentals
  }

  return (
    <RentalContext.Provider value={value}>
      {children}
    </RentalContext.Provider>
  )
}
