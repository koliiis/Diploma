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

          {chat.courseId && (
            <p className="mt-1 text-sm text-gray-600">
              {chat.courseId.description}
            </p>
          )}

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
        </div>
      </div>
    </Link>
  )
}
