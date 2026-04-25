import { useEffect, useState } from 'react'
import { getChats, type Chat } from '../api/chats'
import { Link } from 'react-router-dom'

export function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await getChats()
        setChats(data)
      } catch {
        setError('Не вдалося завантажити чати')
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Chats</h1>

      <div className="mt-6">
        {isLoading && <p className="text-sm text-gray-500">Завантаження...</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat._id}
                to={`/dashboard/chats/${chat._id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 no-underline hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {chat.title}
                </h3>

                {chat.courseId && (
                  <p className="text-sm text-gray-600">
                    {chat.courseId.title}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}