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

        const group = chat.courseId?.groups?.join(', ') ?? ''
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
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0b67a3]">
          Повідомлення
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#10182f] sm:text-4xl">
          Чати
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Переглядайте групові й приватні розмови, закріплюйте важливі чати та
          швидко знаходьте потрібне повідомлення.
        </p>
      </div>

      <div className="mt-6 rounded-[22px] bg-white p-4 shadow-sm">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук за назвою, групою або останнім повідомленням..."
          className="w-full rounded-xl border border-solid border-gray-200 bg-white px-4 py-3 text-sm text-[#10182f] outline-none transition placeholder:text-gray-400 focus:border-[#0b67a3] focus:ring-4 focus:ring-[#0b67a3]/10"
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="rounded-[22px] bg-white p-6 text-sm text-gray-500 shadow-sm">
            Завантаження чатів...
          </div>
        )}

        {error && (
          <div className="rounded-[22px] bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && sortedChats.length === 0 && (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#10182f]">
              Чати не знайдено
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Знайдіть курс і приєднайтесь до чату або змініть пошуковий запит.
            </p>
          </div>
        )}

        {!isLoading && !error && sortedChats.length > 0 && (
          <div className="grid gap-4">
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
