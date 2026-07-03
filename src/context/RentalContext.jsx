import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
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
  const { addLog } = useAudit()

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
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      const totalAmount = totalDays * (data.daily_boundary || 0)
      const downPayment = data.down_payment || 0
      const remainingBalance = totalAmount - downPayment

      // Initialize payments array with down payment if any
      const initialPayments = downPayment > 0 ? [{
        id: Date.now(),
        amount: downPayment,
        date: new Date().toISOString(),
        type: 'downpayment'
      }] : []

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
        payments: initialPayments,
        status: remainingBalance <= 0 ? 'completed' : 'active',
        notes: data.notes || '',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: inserted, error } = await supabase
        .from('rentals')
        .insert([newRental])
        .select()

      if (error) throw error

      setRentals(prev => [inserted[0], ...prev])
      showNotification(`Rental ${newRental.transaction_number} created!`, 'success')
      addLog('Created', 'Rental', `Created rental: ${newRental.transaction_number} - ${data.driver_name} driving ${data.vehicle_plate}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding rental:', error)
      showNotification('Failed to create rental', 'error')
      return null
    }
  }

  // Add payment to rental
  const addPayment = async (id, amount) => {
    try {
      const rental = rentals.find(r => r.id === id)
      if (!rental) {
        showNotification('Rental not found', 'error')
        return null
      }

      // Check if amount exceeds remaining balance
      if (amount > rental.remaining_balance) {
        showNotification(`Amount exceeds remaining balance of ₱${rental.remaining_balance}`, 'error')
        return null
      }

      const newBalance = rental.remaining_balance - amount
      const payments = [...(rental.payments || []), {
        id: Date.now(),
        amount: amount,
        date: new Date().toISOString(),
        type: 'payment'
      }]

      const status = newBalance <= 0 ? 'completed' : 'active'

      const { data: updated, error } = await supabase
        .from('rentals')
        .update({
          remaining_balance: newBalance < 0 ? 0 : newBalance,
          payments: payments,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      // Update vehicle status if completed
      if (status === 'completed') {
        await supabase
          .from('vehicles')
          .update({ status: 'available', updated_at: new Date().toISOString() })
          .eq('id', rental.vehicle_id)
      }

      setRentals(prev => prev.map(r => 
        r.id === id ? updated[0] : r
      ))

      addLog('Paid', 'Rental', `Payment of ₱${amount} recorded for ${rental.transaction_number}`)
      showNotification(`Payment of ₱${amount} recorded!`, 'success')
      return updated[0]
    } catch (error) {
      console.error('Error adding payment:', error)
      showNotification('Failed to record payment', 'error')
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
      addLog('Updated', 'Rental', `Rental ${rental?.transaction_number || 'Unknown'} marked as ${status}`)
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
      addLog('Deleted', 'Rental', `Deleted rental: ${rental?.transaction_number || 'Unknown'}`)
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
    addPayment,
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
