import { useAuthStore } from '../store/authStore'
import { Avatar } from '../components/ui/Avatar'
import { roleLabelUk } from '../utils/roleLabels'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Профіль</h1>

      <div className="mt-6 flex justify-between rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <p className="text-sm text-gray-500">Повне ім’я</p>
          <p className="mt-1 font-medium text-gray-900">{user.fullName}</p>

          {user.role === 'student' && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Група</p>
              <p className="mt-1 font-medium text-gray-900">{user.group}</p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-500">Електронна пошта</p>
            <p className="mt-1 font-medium text-gray-900">{user.email}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Роль</p>
            <p className="mt-1 font-medium text-gray-900">
              {roleLabelUk(user.role)}
            </p>
          </div>
        </div>

        <Avatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="md" />
      </div>
    </div>
  )
}
