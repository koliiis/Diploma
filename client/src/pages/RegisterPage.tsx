import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'

type RegisterErrors = {
  fullName?: string
  group?: string
  email?: string
  password?: string
  general?: string
}

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [group, setGroup] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)

  const navigate = useNavigate()

  const validateForm = () => {
    const nextErrors: RegisterErrors = {}

    const trimmedFullName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedGroup = group.trim()

    const ukrainianFullNameRegex =
      /^[А-ЯІЇЄҐ][а-яіїєґ']+\s+[А-ЯІЇЄҐ][а-яіїєґ']+$/

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const groupRegex = /^[А-ЯІЇЄҐ]{2}-\d{2}$/

    if (!trimmedFullName) {
      nextErrors.fullName = 'Вкажіть імʼя та прізвище'
    } else if (!ukrainianFullNameRegex.test(trimmedFullName)) {
      nextErrors.fullName =
        'Імʼя та прізвище мають бути українською, наприклад: Анна Коваленко'
    }

    if (role === 'student') {
      if (!trimmedGroup) {
        nextErrors.group = 'Вкажіть групу'
      } else if (!groupRegex.test(trimmedGroup)) {
        nextErrors.group = 'Формат групи має бути як ТР-25'
      }
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Вкажіть електронну адресу'
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Введіть коректну електронну адресу'
    }

    if (!password) {
      nextErrors.password = 'Вкажіть пароль'
    } else if (password.length < 8 || !/\d/.test(password)) {
      nextErrors.password =
        'Пароль має містити щонайменше 8 символів і хоча б одну цифру'
    }

    return nextErrors
  }

  const handleRegister = async () => {
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const trimmedFullName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedGroup = group.trim()

    try {
      setErrors({})
      setIsSubmitting(true)

      await register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password,
        role,
        group: role === 'student' ? trimmedGroup : undefined,
      })

      const loginData = await login({
        email: trimmedEmail,
        password,
      })

      localStorage.setItem('campustalk_last_email', trimmedEmail)

      setAuth(loginData.user, loginData.token)
      navigate('/dashboard')
    } catch {
      setErrors({
        general: 'Не вдалося зареєструватися',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#3157a4]">CampusTalk</p>
          <h1 className="mt-2 text-3xl font-bold text-[#172033]">Реєстрація</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Створіть обліковий запис для доступу до курсів, чатів і повідомлень.
          </p>
        </div>

        <div className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
          >
            <option value="student">Студент</option>
            <option value="teacher">Викладач</option>
          </select>

          <div>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Імʼя та прізвище"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {role === 'student' && (
            <div>
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value.toUpperCase())}
                placeholder="Група, наприклад ТР-25"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
              />
              {errors.group && (
                <p className="mt-1 text-sm text-red-600">{errors.group}</p>
              )}
            </div>
          )}

          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Електронна адреса"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3157a4] focus:ring-4 focus:ring-[#3157a4]/10"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </p>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#172033] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#223052] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Уже маєте акаунт?{' '}
            <Link
              to="/login"
              className="font-medium text-[#3157a4] no-underline hover:underline"
            >
              Увійти
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