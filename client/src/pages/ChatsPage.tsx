import { useState } from 'react'
import type { Chat } from '../api/chats'
import { useChatsList } from '../hooks/useChatsList'
import { useAuthStore } from '../store/authStore'
import { ChatListItem } from '../components/chats/ChatListItem'
import { ChatParticipantsModal } from '../components/chats/ChatParticipantsModal'

export function ChatsPage() {
  const { data: chats, isLoading, error } = useChatsList()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const currentUser = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Chats</h1>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && chats.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            У вас поки немає чатів. Знайдіть курс і приєднайтесь до чату.
          </p>
        )}

        {!isLoading && !error && chats.length > 0 && (
          <div className="space-y-4">
            {chats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUserId={currentUser?._id}
                onOpenParticipants={setSelectedChat}
              />
            ))}
          </div>
        )}
      </div>

      {selectedChat && (
        <ChatParticipantsModal
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  )
}
