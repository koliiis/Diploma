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
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Профіль</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar fullName={fullName || user.fullName} avatarUrl={avatarUrl} />

            <div>
              <p className="font-medium text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
              {user.role === 'student' && user.group && (
                <p className="text-sm text-gray-500">Група: {user.group}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setSuccess(null)
                setIsEditing(true)
              }}
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Редагувати
            </button>
          )}
        </div>

        {success && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        )}

        {isEditing && (
          <div className="mt-6 grid gap-4">
            <div>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Імʼя та прізвище"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const dataUrl = await fileToDataUrl(file)
                  setAvatarUrl(dataUrl)
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            {user.role === 'student' && (
              <div>
                <input
                  value={group}
                  onChange={(e) => setGroup(e.target.value.toUpperCase())}
                  placeholder="Група, наприклад ТР-25"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">{errors.group}</p>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="font-medium text-gray-900">Зміна пароля</h2>

              <div className="mt-3 grid gap-3">
                <div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Поточний пароль"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {errors.general && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.general}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {isSaving ? 'Збереження...' : 'Зберегти'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2"
              >
                Скасувати
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}