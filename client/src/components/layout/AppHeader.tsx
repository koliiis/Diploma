import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { LogOut, GraduationCap } from 'lucide-react'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className=" top-0 z-50 h-[72px] border-b border-gray-100 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <Avatar
                fullName={user.fullName}
                avatarUrl={user.avatarUrl}
                size="sm"
              />

              <div className="text-right">
                <p className="text-sm font-semibold text-[#10182f] m-0">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 m-0">
                  {user.role === 'teacher' ? 'Викладач' : 'Студент'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 cursor-pointer"
            title="Вийти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}