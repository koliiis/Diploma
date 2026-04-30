import { useMemo, useState } from 'react'
import type { Chat } from '../api/chats'
import { useChatsList } from '../hooks/useChatsList'
import { useAuthStore } from '../store/authStore'
import { ChatListItem } from '../components/chats/ChatListItem'
import { ChatParticipantsModal } from '../components/chats/ChatParticipantsModal'

export function ChatsPage() {
  const { data: chats, isLoading, error } = useChatsList()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const currentUser = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) => {
        const query = searchQuery.toLowerCase().trim()
  
        const otherParticipant = chat.participantIds.find(
          (participant) => participant._id !== currentUser?._id,
        )
  
        const title =
          chat.type === 'direct'
            ? `Приватні повідомлення з ${
                otherParticipant?.fullName ?? 'користувачем'
              }`
            : chat.courseId?.title ?? chat.title
  
        const group = chat.courseId?.group ?? ''
        const lastMessage = chat.lastMessage?.content ?? ''
  
        return (
          title.toLowerCase().includes(query) ||
          group.toLowerCase().includes(query) ||
          lastMessage.toLowerCase().includes(query)
        )
      }),
    [chats, searchQuery, currentUser?._id],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Чати</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук за назвою, групою або останнім повідомленням..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && filteredChats.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            У вас поки немає чатів. Знайдіть курс і приєднайтесь до чату.
          </p>
        )}

        {!isLoading && !error && filteredChats.length > 0 && (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
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
