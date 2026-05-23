import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { AdminPage } from '../pages/AdminPage'

export function AdminRoute() {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <AdminPage />
}
