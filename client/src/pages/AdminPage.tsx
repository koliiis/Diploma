import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  type AdminUser,
  type AdminUserRole,
} from '../api/admin'
import { Avatar } from '../components/ui/Avatar'
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonPrimarySmallClass,
  buttonSecondaryClass,
  fieldClass,
} from '../components/courses/courseFormClasses'
import { useAuthStore } from '../store/authStore'
import { roleLabelUk } from '../utils/roleLabels'

type UserFormState = {
  fullName: string
  email: string
  password: string
  role: AdminUserRole
  group: string
}

const emptyForm: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  role: 'student',
  group: '',
}

function validateUserForm(
  form: UserFormState,
  options: { requirePassword: boolean },
): string | null {
  const ukrainianFullNameRegex =
    /^[А-ЯІЇЄҐ][а-яіїєґ']+\s+[А-ЯІЇЄҐ][а-яіїєґ']+$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const groupRegex = /^[А-ЯІЇЄҐ]{2}-\d{2}$/

  if (!form.fullName.trim()) {
    return 'Вкажіть імʼя та прізвище'
  }

  if (!ukrainianFullNameRegex.test(form.fullName.trim())) {
    return 'Імʼя та прізвище мають бути українською, наприклад: Анна Коваленко'
  }

  if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
    return 'Введіть коректну електронну адресу'
  }

  if (options.requirePassword) {
    if (!form.password) {
      return 'Вкажіть пароль'
    }

    if (form.password.length < 8 || !/\d/.test(form.password)) {
      return 'Пароль має містити щонайменше 8 символів і хоча б одну цифру'
    }
  } else if (form.password) {
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      return 'Новий пароль має містити щонайменше 8 символів і хоча б одну цифру'
    }
  }

  if (form.role === 'student') {
    const trimmedGroup = form.group.trim().toUpperCase()

    if (!trimmedGroup) {
      return 'Вкажіть групу для студента'
    }

    if (!groupRegex.test(trimmedGroup)) {
      return 'Формат групи має бути як ТР-25'
    }
  }

  return null
}

export function AdminPage() {
  const currentUser = useAuthStore((s) => s.user)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createForm, setCreateForm] = useState<UserFormState>(emptyForm)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UserFormState>(emptyForm)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getAdminUsers()
      setUsers(data)
    } catch {
      toast.error('Не вдалося завантажити користувачів')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) return users

    return users.filter((user) => {
      const haystack = [
        user.fullName,
        user.email,
        user.role,
        user.group ?? '',
        roleLabelUk(user.role),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, searchQuery])

  const handleCreateUser = async () => {
    const validationError = validateUserForm(createForm, { requirePassword: true })

    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setIsSubmitting(true)

      await createAdminUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
        group:
          createForm.role === 'student'
            ? createForm.group.trim().toUpperCase()
            : undefined,
      })

      setCreateForm(emptyForm)
      setIsFormOpen(false)
      await loadUsers()
      toast.success('Користувача створено')
    } catch {
      toast.error('Не вдалося створити користувача')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditUser = (user: AdminUser) => {
    setEditingUserId(user._id)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      group: user.group ?? '',
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUserId) return

    const validationError = validateUserForm(editForm, { requirePassword: false })

    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setIsSubmitting(true)

      await updateAdminUser(editingUserId, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        group:
          editForm.role === 'student'
            ? editForm.group.trim().toUpperCase()
            : undefined,
        ...(editForm.password ? { password: editForm.password } : {}),
      })

      setEditingUserId(null)
      setEditForm(emptyForm)
      await loadUsers()
      toast.success('Користувача оновлено')
    } catch {
      toast.error('Не вдалося оновити користувача')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleBlock = async (user: AdminUser) => {
    if (user._id === currentUser?._id) {
      toast.error('Ви не можете заблокувати власний акаунт')
      return
    }

    const nextBlocked = !user.isBlocked
    const actionLabel = nextBlocked ? 'заблокувати' : 'розблокувати'

    if (!confirm(`Ви впевнені, що хочете ${actionLabel} ${user.fullName}?`)) {
      return
    }

    try {
      await updateAdminUser(user._id, { isBlocked: nextBlocked })
      await loadUsers()
      toast.success(nextBlocked ? 'Користувача заблоковано' : 'Користувача розблоковано')
    } catch {
      toast.error('Не вдалося змінити статус користувача')
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (user._id === currentUser?._id) {
      toast.error('Ви не можете видалити власний акаунт')
      return
    }

    if (!confirm(`Видалити користувача ${user.fullName}?`)) return

    try {
      await deleteAdminUser(user._id)
      await loadUsers()
      toast.success('Користувача видалено')
    } catch {
      toast.error('Не вдалося видалити користувача')
    }
  }

  const renderUserForm = (
    form: UserFormState,
    onChange: (next: UserFormState) => void,
    onSubmit: () => void,
    onCancel: () => void,
    submitLabel: string,
    showPasswordHint: boolean,
  ) => (
    <div className="mt-5 grid gap-4">
      <select
        value={form.role}
        onChange={(e) =>
          onChange({ ...form, role: e.target.value as AdminUserRole })
        }
        className={fieldClass}
      >
        <option value="student">Студент</option>
        <option value="teacher">Викладач</option>
        <option value="admin">Адмін</option>
      </select>

      <input
        value={form.fullName}
        onChange={(e) => onChange({ ...form, fullName: e.target.value })}
        placeholder="Імʼя та прізвище"
        className={fieldClass}
      />

      <input
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        placeholder="Електронна адреса"
        className={fieldClass}
      />

      {form.role === 'student' && (
        <input
          value={form.group}
          onChange={(e) =>
            onChange({ ...form, group: e.target.value.toUpperCase() })
          }
          placeholder="Група, наприклад ТР-25"
          className={fieldClass}
        />
      )}

      <input
        type="password"
        value={form.password}
        onChange={(e) => onChange({ ...form, password: e.target.value })}
        placeholder={
          showPasswordHint
            ? 'Новий пароль (залиште порожнім, щоб не змінювати)'
            : 'Пароль'
        }
        className={fieldClass}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={buttonPrimarySmallClass}
        >
          {isSubmitting ? 'Збереження...' : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={buttonSecondaryClass}
        >
          Скасувати
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
            Керування системою
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#10182f] sm:text-4xl">
            Адмін-панель
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Створюйте користувачів, редагуйте профілі, змінюйте паролі та
            блокуйте доступ до системи.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className={buttonPrimaryClass}
        >
          {isFormOpen ? 'Закрити форму' : 'Створити користувача'}
        </button>
      </div>

      {isFormOpen && (
        <div className="mt-6 rounded-[24px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#10182f]">Новий користувач</h2>
          <p className="mt-1 text-sm text-gray-500">
            Додайте студента, викладача або адміністратора.
          </p>

          {renderUserForm(
            createForm,
            setCreateForm,
            handleCreateUser,
            () => {
              setCreateForm(emptyForm)
              setIsFormOpen(false)
            },
            'Створити',
            false,
          )}
        </div>
      )}

      <div className="mt-6 rounded-[22px] bg-white p-4 shadow-sm">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук за імʼям, email, роллю або групою..."
          className={fieldClass}
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="rounded-[22px] bg-white p-6 text-sm text-gray-500 shadow-sm">
            Завантаження користувачів...
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#10182f]">
              Користувачів не знайдено
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Спробуйте змінити пошуковий запит або створіть нового користувача.
            </p>
          </div>
        )}

        {!isLoading && filteredUsers.length > 0 && (
          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const isEditing = editingUserId === user._id
              const isSelf = user._id === currentUser?._id

              return (
                <div
                  key={user._id}
                  className="overflow-hidden rounded-[24px] bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Avatar fullName={user.fullName} avatarUrl={user.avatarUrl} />

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <>
                          <h3 className="text-xl font-bold text-[#10182f]">
                            Редагування користувача
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Оновіть дані або встановіть новий пароль.
                          </p>

                          {renderUserForm(
                            editForm,
                            setEditForm,
                            handleUpdateUser,
                            () => {
                              setEditingUserId(null)
                              setEditForm(emptyForm)
                            },
                            'Зберегти зміни',
                            true,
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-[#10182f]">
                              {user.fullName}
                            </h3>

                            <span className="rounded-full bg-[#eaf3fb] px-3 py-1 text-xs font-semibold text-[#0b67a3]">
                              {roleLabelUk(user.role)}
                            </span>

                            {user.isBlocked ? (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                Заблоковано
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                Активний
                              </span>
                            )}

                            {isSelf && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                Ви
                              </span>
                            )}
                          </div>

                          <p className="mt-2 break-all text-sm text-gray-600">
                            {user.email}
                          </p>

                          {user.group && (
                            <p className="mt-1 text-sm font-medium text-[#0b67a3]">
                              Група: {user.group}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditUser(user)}
                              className={buttonSecondaryClass}
                            >
                              Редагувати
                            </button>

                            {!isSelf && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlock(user)}
                                  className={
                                    user.isBlocked
                                      ? buttonPrimarySmallClass
                                      : buttonDangerClass
                                  }
                                >
                                  {user.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  className={buttonDangerClass}
                                >
                                  Видалити
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
