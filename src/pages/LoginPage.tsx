import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleLogin = () => {
    login()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CampusTalk</h1>
          <p className="mt-2 text-sm text-gray-600">
            Система асинхронної комунікації студентів і викладачів
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700">
              Це стартова сторінка входу. Пізніше тут буде форма авторизації.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Увійти
          </button>
        </div>
      </div>
    </div>
  )
}