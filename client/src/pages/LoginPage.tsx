import { useState } from 'react'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState(
    localStorage.getItem('campustalk_last_email') ?? '',
  )
  const [password, setPassword] = useState('')

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const data = await login({ email, password })

      localStorage.setItem('campustalk_last_email', email)

      setAuth(data.user, data.token)

      navigate('/dashboard')
    } catch {
      alert('Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
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

      <button
        onClick={handleLogin}
        className="w-full bg-black text-white p-2"
      >
        Login
      </button>
    </div>
  )
}