import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useIdleLogout } from '../hooks/useIdleLogout'
import { AppSidebar } from '../components/layout/AppSidebar'

export function AppLayout() {
  useAutoLogout()
  useIdleLogout()

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#10182f]">
      <AppHeader />

      <div className="flex">
        <AppSidebar />

        <main className="min-h-[calc(100vh-72px)] flex-1 px-4 py-6 mb-48px sm:px-6 lg:(px-8 mb-0)">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}