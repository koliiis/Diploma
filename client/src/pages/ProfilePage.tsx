import { useEffect, useState } from 'react'
import { getUsers, createUser, type User } from '../api/users'

export function ProfilePage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadUsers() {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      setError('Не вдалося завантажити користувачів')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreateUser = async () => {
    try {
      setIsCreating(true)
      await createUser()
      await loadUsers()
    } catch {
      setError('Не вдалося створити користувача')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile Page</h1>

      <div className="mt-4">
        <button
          onClick={handleCreateUser}
          disabled={isCreating}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isCreating ? 'Створення...' : 'Створити користувача'}
        </button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <h3 className="font-medium text-gray-900">
                  {user.fullName}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Role: {user.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}