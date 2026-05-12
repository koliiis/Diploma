import { useState } from 'react'
import { updateProfile } from '../api/users'
import { Avatar } from '../components/ui/Avatar'
import { useAuthStore } from '../store/authStore'
import { fileToDataUrl } from '../utils/fileToDataUrl'

type ProfileErrors = {
  fullName?: string
  group?: string
  newPassword?: string
  currentPassword?: string
  general?: string
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [group, setGroup] = useState(user?.group ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!user) return null

  const validate = () => {
    const nextErrors: ProfileErrors = {}

    const ukrainianFullNameRegex =
      /^[А-ЯІЇЄҐ][а-яіїєґ']+\s+[А-ЯІЇЄҐ][а-яіїєґ']+$/
    const groupRegex = /^[А-ЯІЇЄҐ]{2}-\d{2}$/

    if (!fullName.trim()) {
      nextErrors.fullName = 'Вкажіть імʼя та прізвище'
    } else if (!ukrainianFullNameRegex.test(fullName.trim())) {
      nextErrors.fullName =
        'Імʼя та прізвище мають бути українською, наприклад: Анна Коваленко'
    }

    if (user.role === 'student' && group.trim() && !groupRegex.test(group.trim())) {
      nextErrors.group = 'Формат групи має бути як ТР-25'
    }

    if (newPassword) {
      if (!currentPassword) {
        nextErrors.currentPassword = 'Вкажіть поточний пароль'
      }

      if (newPassword.length < 8 || !/\d/.test(newPassword)) {
        nextErrors.newPassword =
          'Новий пароль має містити щонайменше 8 символів і хоча б одну цифру'
      }
    }

    return nextErrors
  }

  const handleCancel = () => {
    setFullName(user.fullName)
    setAvatarUrl(user.avatarUrl ?? '')
    setGroup(user.group ?? '')
    setCurrentPassword('')
    setNewPassword('')
    setErrors({})
    setSuccess(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setErrors({})
      setSuccess(null)
      setIsSaving(true)

      const updatedUser = await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim(),
        group: user.role === 'student' ? group.trim().toUpperCase() : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })

      updateUser(updatedUser)
      setCurrentPassword('')
      setNewPassword('')
      setSuccess('Профіль оновлено')
      setIsEditing(false)
    } catch {
      setErrors({
        general: 'Не вдалося оновити профіль',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0b67a3] to-[#0f8bd7] p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-full border-4 border-white/20">
              <Avatar
                fullName={fullName || user.fullName}
                avatarUrl={avatarUrl}
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                CampusTalk Profile
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {user.fullName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
                  {user.email}
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1 text-sm capitalize">
                  {user.role}
                </span>

                {user.role === 'student' && user.group && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
                    {user.group}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setSuccess(null)
                setIsEditing(true)
              }}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0b67a3] transition hover:bg-[#f3f8fc] cursor-pointer"
            >
              Редагувати профіль
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
                Особисті дані
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#10182f]">
                Інформація профілю
              </h2>
            </div>
          </div>

          {success && (
            <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {!isEditing ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Ім’я
                </p>

                <p className="mt-2 text-base font-semibold text-[#10182f]">
                  {user.fullName}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-2 break-all text-base font-semibold text-[#10182f]">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Роль
                </p>

                <p className="mt-2 text-base font-semibold capitalize text-[#10182f]">
                  {user.role}
                </p>
              </div>

              {user.role === 'student' && (
                <div className="rounded-2xl bg-[#f8fafc] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Група
                  </p>

                  <p className="mt-2 text-base font-semibold text-[#10182f]">
                    {user.group || 'Не вказано'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10182f]">
                  Ім’я та прізвище
                </label>

                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Імʼя та прізвище"
                  className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
                />

                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#10182f]">
                  Фото профілю
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar
                    fullName={fullName || user.fullName}
                    avatarUrl={avatarUrl}
                    size="lg"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      const dataUrl = await fileToDataUrl(file)
                      setAvatarUrl(dataUrl)
                    }}
                    className="block w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#0b67a3] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#095a8d]"
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10182f]">
                    Група
                  </label>

                  <input
                    value={group}
                    onChange={(e) => setGroup(e.target.value.toUpperCase())}
                    placeholder="ТР-25"
                    className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
                  />

                  {errors.group && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.group}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-3xl border border-gray-100 bg-[#f8fafc] p-5">
                <h3 className="text-lg font-bold text-[#10182f]">
                  Зміна пароля
                </h3>

                <div className="mt-5 grid gap-4">
                  <div>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Поточний пароль"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
                    />

                    {errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Новий пароль"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
                    />

                    {errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errors.general}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-2xl bg-[#0b67a3] px-6 py-3 font-semibold text-white transition hover:bg-[#095a8d] disabled:opacity-50"
                >
                  {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Скасувати
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
              CampusTalk
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#10182f]">
              Ваш акаунт
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Статус
                </p>

                <p className="mt-1 font-semibold text-[#10182f]">
                  Активний користувач
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Доступ
                </p>

                <p className="mt-1 font-semibold text-[#10182f] capitalize">
                  {user.role}
                </p>
              </div>

              {user.group && (
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Академічна група
                  </p>

                  <p className="mt-1 font-semibold text-[#10182f]">
                    {user.group}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}