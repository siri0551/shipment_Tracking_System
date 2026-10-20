import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { authAPI } from '../api'

export default function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      authAPI.getMe().then((res) => setUser(res.data.user)).catch(() => {})
    }
  }, [isAuthenticated, user, setUser])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
