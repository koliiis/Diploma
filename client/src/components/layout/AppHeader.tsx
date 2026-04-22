import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export function AppHeader() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          CampusTalk
        </h2>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-gray-600 hover:text-black">
            Dashboard
          </Link>
          <Link to="/dashboard/courses" className="text-gray-600 hover:text-black">
            Courses
          </Link>
          <Link to="/dashboard/chats" className="text-gray-600 hover:text-black">
            Chats
          </Link>
          <Link to="/dashboard/profile" className="text-gray-600 hover:text-black">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">
            {user ? user.fullName : 'Guest'}
          </span>

          <button
            onClick={logout}
            className="text-gray-500 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}