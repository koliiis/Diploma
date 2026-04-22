import { Outlet } from 'react-router-dom'
import { AppFooter } from '../components/layout/AppFooter'
import { AppHeader } from '../components/layout/AppHeader'

export function AppLayout() {
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