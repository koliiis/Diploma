import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AuthRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
  )
}