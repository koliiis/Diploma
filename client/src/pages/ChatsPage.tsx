import { useMemo, useState } from 'react'
import type { Chat } from '../api/chats'
import { useChatsList } from '../hooks/useChatsList'
import { useAuthStore } from '../store/authStore'
import { ChatListItem } from '../components/chats/ChatListItem'
import { ChatParticipantsModal } from '../components/chats/ChatParticipantsModal'
import { loadPinnedChatIds, savePinnedChatIds } from '../utils/pinnedChatsStorage'

export function ChatsPage() {
  const { data: chats, isLoading, error } = useChatsList()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const currentUser = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [pinnedChatIds, setPinnedChatIds] = useState(loadPinnedChatIds)

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

  const togglePinnedChat = (chatId: string) => {
    setPinnedChatIds((prev) => {
      const next = prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
  
      savePinnedChatIds(next)
      return next
    })
  }

  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      const aPinned = pinnedChatIds.includes(a._id)
      const bPinned = pinnedChatIds.includes(b._id)
  
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
  
      return (
        new Date(b.lastMessageAt ?? b.updatedAt).getTime() -
        new Date(a.lastMessageAt ?? a.updatedAt).getTime()
      )
    })
  }, [filteredChats, pinnedChatIds])

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

        {!isLoading && !error && sortedChats.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            У вас поки немає чатів. Знайдіть курс і приєднайтесь до чату.
          </p>
        )}

        {!isLoading && !error && sortedChats.length > 0 && (
          <div className="space-y-4">
            {sortedChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUserId={currentUser?._id}
                onOpenParticipants={setSelectedChat}
                isPinned={pinnedChatIds.includes(chat._id)}
                onTogglePin={togglePinnedChat}
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
