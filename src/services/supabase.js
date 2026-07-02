import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('customers').select('count', { count: 'exact' })
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err)
    return false
  }
}
