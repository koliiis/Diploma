import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAutoLogout() {
  const logout = useAuthStore((s) => s.logout)
  const isSessionExpired = useAuthStore((s) => s.isSessionExpired)

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        logout()
        window.location.href = '/login'
      }
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [logout, isSessionExpired])
}