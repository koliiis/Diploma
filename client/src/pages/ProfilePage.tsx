import { useAuthStore } from '../store/authStore'
import { Avatar } from '../components/ui/Avatar'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Profile
      </h1>

      <div className="flex justify-between mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <p className="text-sm text-gray-500">Full name</p>
          <p className="mt-1 font-medium text-gray-900">{user.fullName}</p>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-medium text-gray-900">{user.email}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Role</p>
            <p className="mt-1 font-medium text-gray-900">{user.role}</p>
          </div>
        </div>

        <Avatar fullName={user.fullName} avatarUrl={user.avatarUrl} size="md" />
      </div>
    </div>
  )
}