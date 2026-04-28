import type { RefObject } from 'react'
import type { Message } from '../../api/messages'
import { Avatar } from '../ui/Avatar'

type ChatUser = { _id: string } | null

type ChatMessageListProps = {
  messagesRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
  messages: Message[]
  hasMoreMessages: boolean
  isLoadingEarlier: boolean
  onLoadEarlier: () => void
  currentUser: ChatUser
}

export function ChatMessageList({
  messagesRef,
  isLoading,
  messages,
  hasMoreMessages,
  isLoadingEarlier,
  onLoadEarlier,
  currentUser,
}: ChatMessageListProps) {
  return (
    <div
      className="flex-1 space-y-2 overflow-y-auto px-2 py-4"
      ref={messagesRef}
    >
      {isLoading && <p>Завантаження...</p>}

      {hasMoreMessages && !isLoading && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadEarlier}
            disabled={isLoadingEarlier}
            className="rounded-full border border-gray-300 px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
          >
            {isLoadingEarlier ? 'Завантаження...' : 'Попередні повідомлення'}
          </button>
        </div>
      )}

      {!hasMoreMessages && (
        <div className="flex justify-center pb-2">
          <p className="text-sm text-gray-600">Повідомлень більше немає</p>
        </div>
      )}

      {!isLoading &&
        messages.map((msg) => {
          const isMine = msg.authorId._id === currentUser?._id
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${
                isMine ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isMine && (
                <Avatar
                  fullName={msg.authorId.fullName}
                  avatarUrl={msg.authorId.avatarUrl}
                  size="sm"
                />
              )}

              <div
                className={`
                    max-w-xs rounded-2xl px-4 shadow-sm
                    ${
                      isMine
                        ? 'rounded-br-md bg-black text-white'
                        : 'rounded-bl-md bg-gray-200 text-gray-900'
                    }
                  `}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {!isMine && (
                  <p className="mt-1 text-xs opacity-70">
                    {msg.authorId.fullName}
                  </p>
                )}

                {msg.localStatus === 'pending' && (
                  <p className="text-xs opacity-60">Відправляється...</p>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
