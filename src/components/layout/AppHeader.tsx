import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="border-b-solid border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-24px py-16px">
        <h2 className="text-xl font-semibold text-gray-900">
          CampusTalk
        </h2>

        <nav className="flex items-center gap-4 text-md">
          <Link
            to="/dashboard"
            className="text-gray-600 no-underline hover:text-black"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/courses"
            className="text-gray-600 no-underline hover:text-black"
          >
            Courses
          </Link>
          <Link
            to="/dashboard/chats"
            className="text-gray-600 no-underline hover:text-black"
          >
            Chats
          </Link>
          <Link
            to="/dashboard/profile"
            className="text-gray-600 no-underline hover:text-black"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  )
}