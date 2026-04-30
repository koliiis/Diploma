import { Link } from 'react-router-dom'
import type { Chat } from '../../api/chats'
import { Avatar } from '../ui/Avatar'
import { getChatListDisplay } from '../../utils/chatDisplay'

type ChatListItemProps = {
  chat: Chat
  currentUserId: string | undefined
  onOpenParticipants: (chat: Chat) => void
}

export function ChatListItem({
  chat,
  currentUserId,
  onOpenParticipants,
}: ChatListItemProps) {
  const { imageUrl, title } = getChatListDisplay(chat, currentUserId)
  const isCourseChat = chat.type !== 'direct'

  return (
    <Link
      to={`/dashboard/chats/${chat._id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 no-underline hover:bg-gray-50"
    >
      <div className="flex items-start gap-4">
        <Avatar fullName={title} avatarUrl={imageUrl} />

        <div className="min-w-0 flex-1">
          <p className="text-lg font-medium text-gray-900">{title}</p>

          {chat.unreadCount ? (
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
              {chat.unreadCount}
            </span>
          ) : null}

          {chat.courseId?.group && (
            <p className="mt-1 text-sm text-gray-500">
              Група: {chat.courseId.group}
            </p>
          )}

          {isCourseChat && (
            <div className="mt-3 flex items-center gap-3">
              <span
                role="button"
                tabIndex={0}
                className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenParticipants(chat)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onOpenParticipants(chat)
                  }
                }}
              >
                Учасників: {chat.participantIds.length}
              </span>
            </div>
          )}

          {chat.lastMessage ? (
            <p className="mt-1 line-clamp-1 text-sm text-gray-500">
              {chat.lastMessage.authorId._id === currentUserId
                ? 'Ви'
                : chat.lastMessage.authorId.fullName}
              : {chat.lastMessage.content}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">
              Повідомлень ще немає
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
