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
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Вхід</h1>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Електронна адреса"
        className="w-full border p-2"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        className="w-full border p-2"
      />

      <p className="text-sm text-gray-600">
        Немає акаунта?{' '}
        <Link
          to="/register"
          className="text-black underline hover:text-gray-800"
        >
          Зареєструватися
        </Link>
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogin}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Вхід...' : 'Увійти'}
      </button>
    </div>
  )
}