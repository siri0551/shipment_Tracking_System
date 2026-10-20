import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import ShipmentList from './pages/shipments/ShipmentList'
import ShipmentDetail from './pages/shipments/ShipmentDetail'
import CreateShipment from './pages/shipments/CreateShipment'
import TrackingTimeline from './pages/tracking/TrackingTimeline'
import Analytics from './pages/admin/Analytics'
import TamperCheck from './pages/admin/TamperCheck'
import QRPage from './pages/QRPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:trackingId" element={<TrackingTimeline />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shipments" element={<ShipmentList />} />
              <Route path="/shipments/new" element={<CreateShipment />} />
              <Route path="/shipments/:id" element={<ShipmentDetail />} />
              <Route path="/tracking" element={<TrackingTimeline />} />
              <Route path="/tracking/:trackingId" element={<TrackingTimeline />} />
              <Route path="/qr" element={<QRPage />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['Admin']} />}>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tamper" element={<TamperCheck />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
