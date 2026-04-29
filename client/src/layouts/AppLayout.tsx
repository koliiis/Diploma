import { Outlet } from 'react-router-dom'
import { AppFooter } from '../components/layout/AppFooter'
import { AppHeader } from '../components/layout/AppHeader'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useIdleLogout } from '../hooks/useIdleLogout'

export function AppLayout() {
  useAutoLogout()
  useIdleLogout()
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AppHeader />

      <main className="flex-1 p-24px">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}