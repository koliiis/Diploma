import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')

  const setAuth = useAuthStore((s) => s.setAuth)

  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await register({
        fullName,
        email,
        password,
        role,
      })
  
      const loginData = await login({
        email,
        password,
      })
      
      localStorage.setItem('campustalk_last_email', email)
  
      setAuth(loginData.user, loginData.token)
  
      navigate('/dashboard')
    } catch {
      alert('Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        className="w-full border p-2"
      />

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

      <select
        value={role}
        onChange={(e) =>
          setRole(e.target.value as 'student' | 'teacher')
        }
        className="w-full border p-2"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>

      <p className="text-sm text-gray-600">
        Уже маєте акаунт?{' '}
        <Link
          to="/login"
          className="text-black underline hover:text-gray-800"
        >
          Увійти
        </Link>
      </p>

      <button
        onClick={handleRegister}
        className="w-full bg-black text-white p-2"
      >
        Register
      </button>
    </div>
  )
}