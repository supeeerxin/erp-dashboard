import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SupabaseContext = createContext()

const supabaseUrl = 'https://tgdeodxkdymhezfdfncm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGVvZHhrZHltaGV6ZmRmbmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzQzNDUsImV4cCI6MjA5ODU1MDM0NX0.jWoP7wUymhyKcVlcVRgJrB1WULAw352ITcqcqRs2OQQ'

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const client = createClient(supabaseUrl, supabaseKey)
      setSupabase(client)
      console.log('✅ Supabase initialized in context!')
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  return context
}
