import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-16px">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-32px shadow-sm">
        <div className="mb-24px">
          <h1 className="text-3xl font-bold text-gray-900">CampusTalk</h1>
          <p className="mt-8px text-sm text-gray-600">
            Система асинхронної комунікації студентів і викладачів
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-24px">
            Це стартова сторінка входу. Пізніше тут буде форма авторизації.
          </p>

          <Link
            to="/dashboard"
            className="flex items-center justify-center rounded-lg bg-black px-16px py-12px text-sm font-medium text-white no-underline transition hover:opacity-80"
          >
            Увійти
          </Link>
        </div>
      </div>
    </div>
  )
}