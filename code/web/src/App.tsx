import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }       from '@/context/AuthContext'
import { PrefsProvider }      from '@/context/PrefsContext'
import { SimulatorProvider }  from '@/context/SimulatorContext'
import ProtectedRoute         from '@/components/ProtectedRoute'
import AdminRoute             from '@/components/AdminRoute'
import MainLayout             from '@/components/layout/MainLayout'
import Login                  from '@/pages/Login'
import Dashboard              from '@/pages/Dashboard'
import Cabinets               from '@/pages/Cabinets'
import Inventory              from '@/pages/Inventory'
import ActivityLog            from '@/pages/ActivityLog'
import Shifts                 from '@/pages/Shifts'
import Users                  from '@/pages/Users'
import Settings               from '@/pages/Settings'
import Simulator              from '@/pages/Simulator'
import NotFound               from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <PrefsProvider>
        <SimulatorProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index                element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"     element={<Dashboard />} />
              <Route path="cabinets"      element={<Cabinets />} />
              <Route path="inventory"     element={<Inventory />} />
              <Route path="activity"      element={<ActivityLog />} />
              <Route path="shifts"        element={<Shifts />} />
              <Route path="simulator"     element={<Simulator />} />
              <Route path="users"         element={<AdminRoute><Users /></AdminRoute>} />
              <Route path="settings"      element={<Settings />} />
              <Route path="*"             element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SimulatorProvider>
      </PrefsProvider>
    </AuthProvider>
  )
}
