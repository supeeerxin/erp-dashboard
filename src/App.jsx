import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { CustomerProvider } from './context/CustomerContext'
import { RiceCreditProvider } from './context/RiceCreditContext'
import { CashLoanProvider } from './context/CashLoanContext'
import { BreadOrderProvider } from './context/BreadOrderContext'
import { BreadProductProvider } from './context/BreadProductContext'
import { IncomeProvider } from './context/IncomeContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoadingSkeleton from './components/common/LoadingSkeleton'

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
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CustomerProvider>
            <RiceCreditProvider>
              <CashLoanProvider>
                <BreadProductProvider>
                  <BreadOrderProvider>
                    <IncomeProvider>
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
                            </Route>
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </Router>
                    </IncomeProvider>
                  </BreadOrderProvider>
                </BreadProductProvider>
              </CashLoanProvider>
            </RiceCreditProvider>
          </CustomerProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
