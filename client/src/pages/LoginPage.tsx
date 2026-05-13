import { useState } from 'react'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState(
    localStorage.getItem('campustalk_last_email') ?? '',
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password.trim()) {
      setError('Заповніть електронну адресу й пароль')
      return
    }

    try {
      setError(null)
      setIsSubmitting(true)

      const data = await login({
        email: trimmedEmail,
        password,
      })

      localStorage.setItem('campustalk_last_email', trimmedEmail)

      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      setError('Невірна електронна адреса або пароль')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-solid border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#3157a4]">CampusTalk</p>
          <h1 className="mt-2 text-3xl font-bold text-[#172033]">Увійти</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            З поверненням! Введіть свої облікові дані, щоб продовжити
            користування системою.
          </p>
        </div>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Логін або електронна пошта"
            className="w-full rounded-xl border border-solid border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-xl border border-solid border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#172033] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#223052] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Вхід...' : 'Увійти'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Немає акаунта?{' '}
            <Link
              to="/register"
              className="font-medium text-[#3157a4] no-underline hover:underline"
            >
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        © 2026 CampusTalk. Навчальна комунікаційна система.
      </p>
    </div>
  )
}