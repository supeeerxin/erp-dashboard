import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://tgdeodxkdymhezfdfncm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGVvZHhrZHltaGV6ZmRmbmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzQzNDUsImV4cCI6MjA5ODU1MDM0NX0.jWoP7wUymhyKcVlcVRgJrB1WULAw352ITcqcqRs2OQQ'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Test function
window.testSupabase = async function() {
  try {
    console.log('🔍 Testing Supabase...')
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return false
    }
    
    console.log('✅ Supabase connected!')
    console.log('📊 Total customers:', data)
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err)
    return false
  }
}

console.log('✅ Supabase service loaded')
