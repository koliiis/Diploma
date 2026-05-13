import { Link } from 'react-router-dom'
import { Pin, PinOff, UsersRound, MessageCircle } from 'lucide-react'
import type { Chat } from '../../api/chats'
import { Avatar } from '../ui/Avatar'
import { getChatListDisplay } from '../../utils/chatDisplay'

type ChatListItemProps = {
  chat: Chat
  currentUserId: string | undefined
  onOpenParticipants: (chat: Chat) => void
  isPinned: boolean
  onTogglePin: (chatId: string) => void
}

export function ChatListItem({
  chat,
  currentUserId,
  onOpenParticipants,
  isPinned,
  onTogglePin,
}: ChatListItemProps) {
  const { imageUrl, title } = getChatListDisplay(chat, currentUserId)
  const isCourseChat = chat.type !== 'direct'
  const lastMessagePreview = chat.lastMessage?.content.replace(/\s+/g, ' ')

  return (
    <Link
      to={`/dashboard/chats/${chat._id}`}
      className="block rounded-[24px] bg-white p-5 no-underline shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <Avatar fullName={title} avatarUrl={imageUrl} />

          <div className="min-w-0 flex-1 sm:hidden">
            <p className="line-clamp-2 text-lg font-bold text-[#10182f]">
              {title}
            </p>

            {chat.courseId?.groups?.length ? (
              <p className="mt-1 text-sm font-medium text-[#0b67a3]">
                Групи: {chat.courseId.groups.join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="hidden items-start justify-between gap-4 sm:flex">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-xl font-bold text-[#10182f]">
                  {title}
                </p>

                {chat.unreadCount ? (
                  <span className="rounded-full bg-[#0b67a3] px-2 py-0.5 text-xs font-semibold text-white">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>

              {chat.courseId?.groups?.length ? (
                <p className="mt-1 text-sm font-medium text-[#0b67a3]">
                  Групи: {chat.courseId.groups.join(', ')}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTogglePin(chat._id)
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-solid border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 cursor-pointer"
            >
              {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
              {isPinned ? 'Відкріпити' : 'Закріпити'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 sm:hidden">
            {chat.unreadCount ? (
              <span className="rounded-full bg-[#0b67a3] px-2 py-0.5 text-xs font-semibold text-white">
                {chat.unreadCount}
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTogglePin(chat._id)
              }}
              className="flex items-center gap-1 rounded-xl border border-solid border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 cursor-pointer"
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              {isPinned ? 'Відкріпити' : 'Закріпити'}
            </button>
          </div>

          {isCourseChat && (
            <p
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#0b67a3] cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpenParticipants(chat)
              }}
            >
              <UsersRound size={16} />
              Учасників: {chat.participantIds.length}
            </p>
          )}

          <div className="mt-4 rounded-2xl bg-[#f8fafc] p-4">
            {chat.lastMessage ? (
              <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-[#10182f]">
                  {chat.lastMessage.authorId?._id === currentUserId
                    ? 'Ви'
                    : chat.lastMessage.authorId?.fullName ?? 'Користувач'}
                  :
                </span>{' '}
                {lastMessagePreview}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle size={16} />
                Повідомлень ще немає
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
