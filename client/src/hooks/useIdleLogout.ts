import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const IDLE_TIMEOUT = 30 * 60 * 1000

export function useIdleLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    let timeoutId: number

    const logoutByIdle = () => {
      logout()
      navigate('/login', { replace: true })
    }

    const resetTimer = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(logoutByIdle, IDLE_TIMEOUT)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    resetTimer()

    return () => {
      window.clearTimeout(timeoutId)

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [isAuthenticated, logout, navigate])
}