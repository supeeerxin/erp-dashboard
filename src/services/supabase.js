import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseKey)
    
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    console.log('📊 Total customers:', data)
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err)
    return false
  }
}

// Get all customers
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  return data
}

// Add customer
export const addCustomer = async (customer) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
  
  if (error) {
    console.error('Error adding customer:', error)
    return null
  }
  return data
}

// Update customer
export const updateCustomer = async (id, updates) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating customer:', error)
    return null
  }
  return data
}

// Delete customer (soft delete)
export const deleteCustomer = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .update({ is_deleted: true })
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error deleting customer:', error)
    return null
  }
  return data
}
