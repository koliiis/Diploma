import { Outlet } from 'react-router-dom'
import { AppFooter } from '../components/layout/AppFooter'
import { AppHeader } from '../components/layout/AppHeader'

export function AppLayout() {
  return (
    <div>
      <AppHeader />

      <main>
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}