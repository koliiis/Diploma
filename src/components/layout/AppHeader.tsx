import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="border-b-solid border-gray-200 px-24px py-16px">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">CampusTalk</h2>

        <nav className="flex gap-4">
          <Link to="/dashboard" className="text-gray-600 no-underline hover:text-black">
            Dashboard
          </Link>
          <Link to="/dashboard/courses" className="text-gray-600 no-underline hover:text-black">
            Courses
          </Link>
          <Link to="/dashboard/chats" className="text-gray-600 no-underline hover:text-black">
            Chats
          </Link>
          <Link to="/dashboard/profile" className="text-gray-600 no-underline hover:text-black">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  )
}