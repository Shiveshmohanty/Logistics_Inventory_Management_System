
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import ShipmentsPage from './pages/ShipmentsPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import WarehousesPage from './pages/WarehousesPage'
import SettingsPage from './pages/SettingsPage'
import VersionHistoryPage from './pages/VersionHistoryPage'
import { Toaster } from '@/components/ui/toaster'

// ScrollToTop component to handle scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

// Admin route component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/shipments" element={
          <ProtectedRoute>
            <ShipmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        } />
        <Route path="/warehouses" element={
          <AdminRoute>
            <WarehousesPage />
          </AdminRoute>
        } />
        <Route path="/settings" element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        } />
        <Route path="/version-history" element={
          <AdminRoute>
            <VersionHistoryPage />
          </AdminRoute>
        } />
        {/* Redirect any unknown routes to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
  