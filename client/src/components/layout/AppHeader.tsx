import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          CampusTalk
        </h2>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-gray-600 hover:text-black">
            Головна сторінка
          </Link>
          <Link to="/dashboard/courses" className="text-gray-600 hover:text-black">
            Курси
          </Link>
          <Link to="/dashboard/chats" className="text-gray-600 hover:text-black">
            Чати
          </Link>
          <Link to="/dashboard/profile" className="text-gray-600 hover:text-black">
            Профіль
          </Link>
        </nav>

        <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
            <span className="text-sm text-gray-600">{user.fullName}</span>
          </div>
        )}

          <button
            onClick={handleLogout}
            className="rounded-lg border-none bg-gray-200 text-gray-600 px-3 py-1 text-sm hover:bg-gray-300 cursor-pointer"
          >
            Вийти
          </button>
        </div>
      </div>
    </header>
  )
}