import { Link, useLocation } from 'react-router-dom'
import {
  House,
  BookOpen,
  MessageCircle,
  UserRound,
  Wifi,
  Bell,
  GraduationCap,
} from 'lucide-react'

const navItems = [
  {
    to: '/dashboard',
    label: 'Головна',
    icon: House,
  },
  {
    to: '/dashboard/courses',
    label: 'Курси',
    icon: BookOpen,
  },
  {
    to: '/dashboard/chats',
    label: 'Чати',
    icon: MessageCircle,
  },
  {
    to: '/dashboard/profile',
    label: 'Профіль',
    icon: UserRound,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <>
      <aside className="sticky top-0 mt--72px hidden h-100vh w-[280px] shrink-0 bg-white px-3 py-6 lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b5f9f] text-lg font-bold text-white">
            <GraduationCap size={24} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-#000 mb-2 mt-0">
              Електронний
            </p>
            <h1 className="-mt-1 text-xl font-bold leading-none text-[#0b426d] m-0">
              CampusTalk
            </h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            const Icon = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold no-underline transition
                  ${
                    isActive
                      ? 'bg-[#0b67a3] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-[#f5f6fb] hover:text-[#10182f]'
                  }
                `}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 border-t border-t-solid border-gray-100 pt-6">
          <p className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Система
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500">
              <Wifi size={18} />
              Offline режим
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500">
              <Bell size={18} />
              Realtime повідомлення
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-t-solid border-gray-200 bg-white lg:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium no-underline
                ${isActive ? 'text-[#0b67a3]' : 'text-gray-500'}
              `}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}