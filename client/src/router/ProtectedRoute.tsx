import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isSessionExpired = useAuthStore((s) => s.isSessionExpired)
  const logout = useAuthStore((s) => s.logout)

  if (!isAuthenticated || isSessionExpired()) {
    logout()
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}