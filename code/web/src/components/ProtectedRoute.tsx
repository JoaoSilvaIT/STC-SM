import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
