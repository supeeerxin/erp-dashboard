import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { CustomerProvider } from './context/CustomerContext'
import { RiceCreditProvider } from './context/RiceCreditContext'
import { CashLoanProvider } from './context/CashLoanContext'
import { BreadProductProvider } from './context/BreadProductContext'
import { BreadOrderProvider } from './context/BreadOrderContext'
import { IncomeProvider } from './context/IncomeContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { PayableProvider } from './context/PayableContext'
import { AuditProvider } from './context/AuditContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoadingSkeleton from './components/common/LoadingSkeleton'

// ============================================
// SUPABASE - Lazy initialization
// ============================================
let supabaseInstance = null

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance
  
  const supabaseUrl = 'https://tgdeodxkdymhezfdfncm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGVvZHhrZHltaGV6ZmRmbmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzQzNDUsImV4cCI6MjA5ODU1MDM0NX0.jWoP7wUymhyKcVlcVRgJrB1WULAw352ITcqcqRs2OQQ'
  
  // Import dynamically to avoid load issues
  import('@supabase/supabase-js').then(module => {
    supabaseInstance = module.createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase initialized!')
  }).catch(err => {
    console.error('❌ Failed to load Supabase:', err)
  })
  
  return supabaseInstance
}

// Test function for console
window.testSupabase = async function() {
  const supabase = await getSupabase()
  if (!supabase) {
    console.log('⏳ Supabase not ready yet, try again in a moment')
    return
  }
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })
    if (error) throw error
    console.log('✅ Connected!', data)
    return true
  } catch (err) {
    console.error('❌ Error:', err)
    return false
  }
}

// Test function
window.testSupabase = async function() {
  try {
    console.log('🔍 Testing Supabase...')
    const supabase = await getSupabase()
    
    if (!supabase) {
      console.error('❌ Supabase not available')
      return false
    }
    
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error:', error)
      return false
    }
    console.log('✅ Connected! Total customers:', data)
    return true
  } catch (err) {
    console.error('❌ Failed:', err)
    return false
  }
}
// ============================================

const Dashboard = lazy(() => import('./pages/Dashboard'))
const RiceCredit = lazy(() => import('./pages/RiceCredit'))
const CashLoans = lazy(() => import('./pages/CashLoans'))
const BreadOrders = lazy(() => import('./pages/BreadOrders'))
const Customers = lazy(() => import('./pages/Customers'))
const Income = lazy(() => import('./pages/Income'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Payables = lazy(() => import('./pages/Payables'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const DueDates = lazy(() => import('./pages/DueDates'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  // Initialize Supabase on mount
  useEffect(() => {
    getSupabase().catch(console.error)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AuditProvider>
            <CustomerProvider>
              <RiceCreditProvider>
                <CashLoanProvider>
                  <BreadProductProvider>
                    <BreadOrderProvider>
                      <IncomeProvider>
                        <ExpenseProvider>
                          <PayableProvider>
                            <Router>
                              <Suspense fallback={<LoadingSkeleton />}>
                                <Routes>
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="rice-credit" element={<RiceCredit />} />
                                    <Route path="cash-loans" element={<CashLoans />} />
                                    <Route path="bread-orders" element={<BreadOrders />} />
                                    <Route path="customers" element={<Customers />} />
                                    <Route path="income" element={<Income />} />
                                    <Route path="expenses" element={<Expenses />} />
                                    <Route path="wallet" element={<Wallet />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="settings" element={<Settings />} />
                                    <Route path="payables" element={<Payables />} />
                                    <Route path="audit-log" element={<AuditLog />} />
                                    <Route path="due-dates" element={<DueDates />} />
                                  </Route>
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </Suspense>
                            </Router>
                          </PayableProvider>
                        </ExpenseProvider>
                      </IncomeProvider>
                    </BreadOrderProvider>
                  </BreadProductProvider>
                </CashLoanProvider>
              </RiceCreditProvider>
            </CustomerProvider>
          </AuditProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
