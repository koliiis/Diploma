import { useState, type RefObject } from 'react'
import type { Message } from '../../api/messages'
import { Avatar } from '../ui/Avatar'
import { formatMessageDate, formatMessageTime } from '../../utils/dateFormat'

type ChatUser = { _id: string } | null

type ChatMessageListProps = {
  messagesRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
  messages: Message[]
  hasMoreMessages: boolean
  isLoadingEarlier: boolean
  onLoadEarlier: () => void
  currentUser: ChatUser
  onEditMessage: (id: string, content: string) => void
  onDeleteMessage: (id: string) => void
  onScroll: () => void
  onRetryMessage: (messageId: string) => void
}

export function ChatMessageList({
  messagesRef,
  isLoading,
  messages,
  hasMoreMessages,
  isLoadingEarlier,
  onLoadEarlier,
  currentUser,
  onEditMessage,
  onDeleteMessage,
  onScroll,
  onRetryMessage,
}: ChatMessageListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  return (
    <div
      className="flex-1 space-y-2 overflow-y-auto px-2 py-4"
      ref={messagesRef}
      onScroll={onScroll}
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
        messages.map((msg, index) => {
          const isMine = msg.authorId._id === currentUser?._id

          const previousMessage = messages[index - 1]

          const shouldShowDateDivider =
            !previousMessage ||
            formatMessageDate(previousMessage.createdAt) !==
              formatMessageDate(msg.createdAt)

        return (
          <div key={msg._id}>
            {shouldShowDateDivider && (
              <div className="my-4 flex justify-center">
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                  {formatMessageDate(msg.createdAt)}
                </span>
              </div>
            )}
        
            <div
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
                {editingId === msg._id ? (
                  <div className="flex flex-col gap-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    />

                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => {
                          onEditMessage(msg._id, editText)
                          setEditingId(null)
                        }}
                      >
                        Save
                      </button>

                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {isMine && editingId !== msg._id && (
                  <div className="mt-1 flex gap-2 text-xs opacity-70">
                    <button
                      onClick={() => {
                        setEditingId(msg._id)
                        setEditText(msg.content)
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDeleteMessage(msg._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {!isMine && (
                  <p className="mt-1 text-xs opacity-70">
                    {msg.authorId.fullName}
                  </p>
                )}

                {msg.localStatus === 'pending' && (
                  <p className="text-xs opacity-60">Відправляється...</p>
                )}

                {msg.localStatus === 'failed' && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-red-500">
                    <span>Message failed ❌</span>

                    <button
                      type="button"
                      onClick={() => onRetryMessage(msg._id)}
                      className="underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <p className="mt-1 text-right text-[11px] opacity-60">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          </div>
          )
        })}
    </div>
  )
}
